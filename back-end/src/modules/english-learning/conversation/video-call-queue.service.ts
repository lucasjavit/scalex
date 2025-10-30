import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { toZonedTime } from 'date-fns-tz';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ActivePeriod } from './entities/active-period.entity';
import { QueueUser } from './entities/queue-user.entity';
import { SessionRoom } from './entities/session-room.entity';
import { Session } from './entities/session.entity';
import {
  VideoCallQueue,
  QueueStatus,
} from './entities/video-call-queue.entity';
import {
  VideoCallSession,
  SessionStatus,
} from './entities/video-call-session.entity';
import { VideoCallActivePeriod } from './entities/video-call-active-period.entity';

@Injectable()
export class VideoCallQueueService implements OnModuleInit {
  private readonly logger = new Logger(VideoCallQueueService.name);

  // In-memory storage for sessions (kept for backward compatibility with existing logic)
  private sessions: Map<string, Session> = new Map(); // sessionId -> Session
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId
  private sessionRooms: Map<string, SessionRoom> = new Map(); // roomName -> SessionRoom

  private sessionTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private nextSessionTime: Date | null = null;

  // Lock mechanism to prevent race conditions in immediate matching
  private matchLocks: Map<string, Promise<void>> = new Map(); // level -> lock promise
  private readonly SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms
  private readonly WAIT_DURATION = 2 * 60 * 1000; // 2 minutes in ms
  private readonly TIMEZONE = 'America/Sao_Paulo';

  // Manual override controls
  private manualOverride: boolean = false; // true = force disable, false = follow schedule
  private manuallyDisabled: boolean = false;

  // Horários programados - carregados do banco de dados
  private activePeriods: ActivePeriod[] = []; // Will be loaded from database

  constructor(
    @InjectRepository(VideoCallQueue)
    private queueRepository: Repository<VideoCallQueue>,
    @InjectRepository(VideoCallSession)
    private sessionRepository: Repository<VideoCallSession>,
    @InjectRepository(VideoCallActivePeriod)
    private periodRepository: Repository<VideoCallActivePeriod>,
  ) {
    this.loadPeriodsFromDatabase(); // Load periods on startup
    this.startSessionTimer();
  }

  /**
   * Hook executado quando o módulo é inicializado
   * Limpa sessões expiradas que podem ter ficado ativas após restart
   */
  async onModuleInit() {
    this.logger.log('🔧 Initializing VideoCallQueueService...');
    await this.cleanupExpiredSessions();
    this.logger.log('✅ VideoCallQueueService initialized');
  }

  /**
   * Cron job executado a cada minuto para limpar sessões expiradas
   * Garante que sessões expiram mesmo após restart do servidor
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredSessions() {
    await this.cleanupExpiredSessions();
  }

  /**
   * Limpa sessões expiradas do banco de dados
   */
  private async cleanupExpiredSessions() {
    try {
      const now = new Date();

      // Busca sessões ativas que já expiraram
      const expiredSessions = await this.sessionRepository.find({
        where: {
          status: SessionStatus.ACTIVE,
          expiresAt: LessThan(now),
        },
      });

      if (expiredSessions.length > 0) {
        this.logger.log(
          `🧹 Cleaning up ${expiredSessions.length} expired sessions...`,
        );

        // Marca como completas
        await this.sessionRepository.update(
          {
            status: SessionStatus.ACTIVE,
            expiresAt: LessThan(now),
          },
          {
            status: SessionStatus.COMPLETED,
          },
        );

        // Remove da memória
        for (const session of expiredSessions) {
          this.sessionRooms.delete(session.roomName);
          this.userSessions.delete(session.user1Id);
          this.userSessions.delete(session.user2Id);
        }

        this.logger.log(`✅ Cleaned up ${expiredSessions.length} expired sessions`);
      }
    } catch (error) {
      this.logger.error('❌ Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Carrega períodos ativos do banco de dados
   */
  private async loadPeriodsFromDatabase() {
    try {
      const periods = await this.periodRepository.find({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
      });

      this.activePeriods = periods.map((p) => ({
        start: { hour: p.startHour, minute: p.startMinute },
        end: { hour: p.endHour, minute: p.endMinute },
      }));

      this.logger.log(
        `Loaded ${this.activePeriods.length} active periods from database`,
      );
    } catch (error) {
      this.logger.error('Error loading periods from database:', error);
      // Fallback to default periods if database fails
      this.activePeriods = [
        { start: { hour: 7, minute: 0 }, end: { hour: 9, minute: 30 } },
        { start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 0 } },
        { start: { hour: 15, minute: 0 }, end: { hour: 16, minute: 0 } },
        { start: { hour: 19, minute: 0 }, end: { hour: 20, minute: 0 } },
        { start: { hour: 21, minute: 0 }, end: { hour: 22, minute: 30 } },
      ];
    }
  }

  /**
   * Obtém a data/hora atual no timezone de São Paulo
   */
  private getNowInBrazil(): Date {
    const utcNow = new Date();
    const brazilNow = toZonedTime(utcNow, this.TIMEZONE);

    // Log apenas a cada minuto para não poluir
    const seconds = brazilNow.getSeconds();
    if (seconds === 0) {
      this.logger.log(
        `🕐 Horário Brasil: ${brazilNow.toLocaleString('pt-BR', { timeZone: this.TIMEZONE })}`,
      );
    }

    return brazilNow;
  }

  /**
   * Verifica se está em um período ativo
   */
  private isInActivePeriod(date: Date): boolean {
    // Se está manualmente desabilitado, retorna false
    if (this.manualOverride && this.manuallyDisabled) {
      return false;
    }

    const hour = date.getHours();
    const minute = date.getMinutes();
    const currentMinutes = hour * 60 + minute;

    return this.activePeriods.some((period) => {
      const startMinutes = period.start.hour * 60 + period.start.minute;
      const endMinutes = period.end.hour * 60 + period.end.minute;
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  }

  /**
   * Obtém o período ativo atual
   */
  private getCurrentActivePeriod(date: Date): ActivePeriod | null {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const currentMinutes = hour * 60 + minute;

    return (
      this.activePeriods.find((period) => {
        const startMinutes = period.start.hour * 60 + period.start.minute;
        const endMinutes = period.end.hour * 60 + period.end.minute;
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }) || null
    );
  }

  /**
   * Verifica se dá tempo de iniciar uma nova sessão antes do período acabar
   */
  private canAcceptNewSession(now: Date): boolean {
    const currentPeriod = this.getCurrentActivePeriod(now);
    if (!currentPeriod) {
      return false;
    }

    const periodEndMinutes =
      currentPeriod.end.hour * 60 + currentPeriod.end.minute;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const minutesUntilEnd = periodEndMinutes - nowMinutes;

    // Precisa de pelo menos 10 minutos para completar uma sessão
    return minutesUntilEnd >= 10;
  }

  /**
   * Obtém o próximo período ativo
   */
  private getNextActivePeriod(now: Date): ActivePeriod | null {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Encontra o próximo período hoje
    const nextToday = this.activePeriods.find((period) => {
      const startMinutes = period.start.hour * 60 + period.start.minute;
      return startMinutes > currentMinutes;
    });

    if (nextToday) {
      return nextToday;
    }

    // Se não há mais períodos hoje, retorna o primeiro de amanhã
    return this.activePeriods[0];
  }

  /**
   * Calcula o horário de início do próximo período
   */
  private getNextPeriodStartTime(now: Date): Date {
    const nextPeriod = this.getNextActivePeriod(now);
    if (!nextPeriod) {
      return now;
    }

    const nextStart = new Date(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextStartMinutes =
      nextPeriod.start.hour * 60 + nextPeriod.start.minute;

    // Se o próximo período é hoje
    if (nextStartMinutes > currentMinutes) {
      nextStart.setHours(nextPeriod.start.hour, nextPeriod.start.minute, 0, 0);
    } else {
      // Próximo período é amanhã
      nextStart.setDate(nextStart.getDate() + 1);
      nextStart.setHours(nextPeriod.start.hour, nextPeriod.start.minute, 0, 0);
    }

    return nextStart;
  }

  /**
   * Adiciona um usuário à fila
   */
  async joinQueue(dto: JoinQueueDto): Promise<{
    success: boolean;
    message: string;
    queuePosition: number;
    nextSessionTime: Date | null;
  }> {
    const now = this.getNowInBrazil();

    // Verifica se está em período ativo
    if (!this.isInActivePeriod(now)) {
      const nextPeriodStart = this.getNextPeriodStartTime(now);
      const hours = String(nextPeriodStart.getHours()).padStart(2, '0');
      const minutes = String(nextPeriodStart.getMinutes()).padStart(2, '0');

      return {
        success: false,
        message: `Sistema indisponível. Próximo horário: ${hours}:${minutes}`,
        queuePosition: -1,
        nextSessionTime: nextPeriodStart,
      };
    }

    // Verifica se dá tempo de começar uma nova sessão
    if (!this.canAcceptNewSession(now)) {
      const nextPeriodStart = this.getNextPeriodStartTime(now);
      const hours = String(nextPeriodStart.getHours()).padStart(2, '0');
      const minutes = String(nextPeriodStart.getMinutes()).padStart(2, '0');

      return {
        success: false,
        message: `Período encerrando. Próximo horário: ${hours}:${minutes}`,
        queuePosition: -1,
        nextSessionTime: nextPeriodStart,
      };
    }

    // Verifica se o usuário já está na fila
    const existingInQueue = await this.queueRepository.findOne({
      where: { userId: dto.userId, status: QueueStatus.WAITING },
    });

    if (existingInQueue) {
      return {
        success: false,
        message: 'Você já está na fila',
        queuePosition: await this.getQueuePosition(dto.userId),
        nextSessionTime: this.nextSessionTime,
      };
    }

    // Verifica se o usuário já está em uma sessão ativa
    if (this.userSessions.has(dto.userId)) {
      const sessionId = this.userSessions.get(dto.userId);
      if (sessionId) {
        const session = this.sessions.get(sessionId);
        if (session && session.status === 'active') {
          return {
            success: false,
            message: 'Você já está em uma sessão ativa',
            queuePosition: -1,
            nextSessionTime: this.nextSessionTime,
          };
        }
      }
    }

    try {
      await this.queueRepository.save({
        userId: dto.userId,
        level: dto.level,
        topic: dto.topic || 'random',
        language: dto.language || 'en',
        status: QueueStatus.WAITING,
      });

      const queueSize = await this.queueRepository.count({
        where: { status: QueueStatus.WAITING },
      });
      this.logger.log(
        `User ${dto.userId} joined queue. Level: ${dto.level}. Queue size: ${queueSize}`,
      );

      // Tenta fazer match imediato se houver outro usuário do mesmo nível esperando
      await this.tryImmediateMatch(dto.level);

      return {
        success: true,
        message: 'Você entrou na fila com sucesso',
        queuePosition: await this.getQueuePosition(dto.userId),
        nextSessionTime: this.nextSessionTime,
      };
    } catch (error) {
      this.logger.error(`Error adding user ${dto.userId} to queue:`, error);
      return {
        success: false,
        message: 'Erro ao entrar na fila. Tente novamente.',
        queuePosition: -1,
        nextSessionTime: this.nextSessionTime,
      };
    }
  }

  /**
   * Remove um usuário da fila
   */
  async leaveQueue(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const existingInQueue = await this.queueRepository.findOne({
      where: { userId, status: QueueStatus.WAITING },
    });

    if (!existingInQueue) {
      this.logger.log(
        `❌ User ${userId} tried to leave queue but was not in queue`,
      );
      return {
        success: false,
        message: 'Você não está na fila',
      };
    }

    try {
      await this.queueRepository.delete({
        userId,
        status: QueueStatus.WAITING,
      });
      const queueSize = await this.queueRepository.count({
        where: { status: QueueStatus.WAITING },
      });
      this.logger.log(
        `👋 User ${userId} left queue. Queue size: ${queueSize}`,
      );

      return {
        success: true,
        message: 'Você saiu da fila',
      };
    } catch (error) {
      this.logger.error(`Error removing user ${userId} from queue:`, error);
      return {
        success: false,
        message: 'Erro ao sair da fila. Tente novamente.',
      };
    }
  }

  /**
   * Obtém o status da fila para um usuário
   */
  async getQueueStatus(userId: string) {
    const existingInQueue = await this.queueRepository.findOne({
      where: { userId, status: QueueStatus.WAITING },
    });

    const inQueue = !!existingInQueue;
    const queuePosition = inQueue ? await this.getQueuePosition(userId) : -1;
    const queueSize = await this.queueRepository.count({
      where: { status: QueueStatus.WAITING },
    });

    this.logger.log(
      `📊 Queue Status for ${userId}: inQueue=${inQueue}, position=${queuePosition}, size=${queueSize}`,
    );

    // Verifica se está em sessão ativa
    const sessionId = this.userSessions.get(userId);
    let currentSession: {
      sessionId: string;
      roomName: string;
      partner: string;
      level: string;
      startTime: Date;
      endTime: Date | null;
    } | null = null;

    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session && session.status === 'active') {
        // Encontra a room do usuário
        const userRoom = session.rooms.find(
          (room) => room.user1 === userId || room.user2 === userId,
        );

        if (userRoom) {
          currentSession = {
            sessionId: session.sessionId,
            roomName: userRoom.roomName,
            partner:
              userRoom.user1 === userId ? userRoom.user2 : userRoom.user1,
            level: userRoom.level,
            startTime: session.startTime,
            endTime: session.endTime,
          };
        }
      }
    }

    return {
      inQueue,
      queuePosition,
      queueSize,
      nextSessionTime: this.nextSessionTime,
      currentSession,
    };
  }

  /**
   * Obtém a posição do usuário na fila
   */
  private async getQueuePosition(userId: string): Promise<number> {
    const queueItems = await this.queueRepository.find({
      where: { status: QueueStatus.WAITING },
      order: { joinedAt: 'ASC' },
    });

    return queueItems.findIndex((item) => item.userId === userId) + 1;
  }

  /**
   * Inicia o timer automático de sessões
   */
  private startSessionTimer() {
    const now = this.getNowInBrazil();

    // Se não está em período ativo, agenda para o próximo período
    if (!this.isInActivePeriod(now)) {
      const nextPeriodStart = this.getNextPeriodStartTime(now);
      const timeUntilStart = nextPeriodStart.getTime() - now.getTime();

      // Atualiza nextSessionTime para null quando sistema está inativo
      this.nextSessionTime = null;

      this.logger.log(
        `Sistema INATIVO. Próximo período: ${nextPeriodStart.toISOString()}`,
      );
      this.logger.log(
        `Aguardando ${Math.round(timeUntilStart / 1000 / 60)} minutos`,
      );

      this.sessionTimer = setTimeout(() => {
        this.logger.log('=== SISTEMA ATIVADO ===');
        this.startSessionTimer();
      }, timeUntilStart);

      return;
    }

    // Se não dá tempo para outra sessão, agenda para o próximo período
    if (!this.canAcceptNewSession(now)) {
      const currentPeriod = this.getCurrentActivePeriod(now);
      this.logger.log(`Período atual encerrando. Não aceita mais sessões.`);

      // Atualiza nextSessionTime para null quando período está encerrando
      this.nextSessionTime = null;

      // Agenda limpeza da fila
      this.scheduleQueueCleanup();

      // Agenda próximo período
      const nextPeriodStart = this.getNextPeriodStartTime(now);
      const timeUntilStart = nextPeriodStart.getTime() - now.getTime();

      this.sessionTimer = setTimeout(() => {
        this.logger.log('=== NOVO PERÍODO INICIADO ===');
        this.startSessionTimer();
      }, timeUntilStart);

      return;
    }

    // Calcula a próxima sessão alinhada a 10 minutos
    const minutes = now.getMinutes();
    const nextMinute = Math.ceil((minutes + 1) / 10) * 10;
    const nextSession = new Date(now);
    nextSession.setMinutes(nextMinute, 0, 0);

    if (nextSession <= now) {
      nextSession.setMinutes(nextSession.getMinutes() + 10);
    }

    this.nextSessionTime = nextSession;
    const timeUntilNextSession = nextSession.getTime() - now.getTime();

    this.logger.log(`Próxima sessão: ${nextSession.toISOString()}`);
    this.logger.log(
      `Tempo até próxima sessão: ${Math.round(timeUntilNextSession / 1000)}s`,
    );

    this.sessionTimer = setTimeout(() => {
      this.createSession();
    }, timeUntilNextSession);
  }

  /**
   * Cria uma nova sessão com os usuários da fila
   */
  private async createSession() {
    this.logger.log('=== CREATING NEW SESSION ===');

    const queueSize = await this.queueRepository.count({
      where: { status: QueueStatus.WAITING },
    });
    this.logger.log(`Queue size: ${queueSize}`);

    if (queueSize < 2) {
      this.logger.log(
        'Not enough users in queue (need at least 2). Skipping session.',
      );
      this.scheduleNextSession();
      return;
    }

    // Agrupa usuários por nível
    const usersByLevel = await this.groupUsersByLevel();

    const sessionId = `session_${Date.now()}`;
    const sessionRooms: SessionRoom[] = [];
    const sessionsToSave: Partial<VideoCallSession>[] = [];
    const userIdsToRemove: string[] = [];

    // Cria pares para cada nível
    for (const [level, users] of Object.entries(usersByLevel)) {
      this.logger.log(`Level ${level}: ${users.length} users`);

      // Emparelha usuários (ignora o último se for ímpar)
      for (let i = 0; i < users.length - 1; i += 2) {
        const user1 = users[i];
        const user2 = users[i + 1];

        const roomName = `room_${sessionId}_${level}_${i / 2}`;
        const room: SessionRoom = {
          roomName,
          sessionId,
          user1: user1.userId,
          user2: user2.userId,
          level,
          createdAt: new Date(),
          endedAt: null,
          status: 'active',
        };

        const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

        // Prepara sessão para salvar no banco
        sessionsToSave.push({
          sessionId,
          user1Id: user1.userId,
          user2Id: user2.userId,
          roomName,
          level,
          topic: user1.topic || 'random',
          language: user1.language || 'en',
          startedAt: new Date(),
          expiresAt,
          status: SessionStatus.ACTIVE,
        });

        sessionRooms.push(room);
        userIdsToRemove.push(user1.userId, user2.userId);

        this.logger.log(
          `Prepared room: ${roomName} for users ${user1.userId} and ${user2.userId}`,
        );
      }

      // Mantém usuários ímpares na fila para aguardarem o próximo match
      if (users.length % 2 !== 0) {
        const oddUser = users[users.length - 1];
        this.logger.log(
          `User ${oddUser.userId} remains in queue (odd number). Waiting for next match.`,
        );
      }
    }

    if (sessionRooms.length === 0) {
      this.logger.log('No rooms created. Skipping session.');
      this.scheduleNextSession();
      return;
    }

    // Salva todas as sessões e remove usuários da fila em uma ÚNICA TRANSAÇÃO
    try {
      await this.sessionRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // 1. Salva todas as sessões
          await transactionalEntityManager.save(
            VideoCallSession,
            sessionsToSave,
          );

          // 2. Remove todos os usuários pareados da fila
          if (userIdsToRemove.length > 0) {
            await transactionalEntityManager.delete(VideoCallQueue, {
              userId: In(userIdsToRemove),
              status: QueueStatus.WAITING,
            });
          }

          this.logger.log(
            `✅ Transaction completed: ${sessionsToSave.length} sessions saved, ${userIdsToRemove.length} users removed from queue`,
          );
        },
      );

      // Apenas atualiza memória APÓS transação bem-sucedida
      for (const room of sessionRooms) {
        this.sessionRooms.set(room.roomName, room);
        this.userSessions.set(room.user1, sessionId);
        this.userSessions.set(room.user2, sessionId);
      }
    } catch (error) {
      this.logger.error('❌ Error in session creation transaction:', error);
      this.scheduleNextSession();
      return;
    }

    const endTime = new Date(Date.now() + this.SESSION_DURATION);
    const session: Session = {
      sessionId,
      startTime: new Date(),
      endTime,
      status: 'active',
      rooms: sessionRooms,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.logger.log(
      `Session ${sessionId} created with ${sessionRooms.length} rooms`,
    );
    this.logger.log(`Session will end at ${endTime.toISOString()}`);

    // Agenda o fim da sessão
    setTimeout(() => {
      this.endSession(sessionId);
    }, this.SESSION_DURATION);

    this.scheduleNextSession();
  }

  /**
   * Agrupa usuários por nível
   */
  private async groupUsersByLevel(): Promise<
    Record<
      string,
      Array<{
        userId: string;
        level: string;
        topic: string;
        language: string;
        joinedAt: Date;
      }>
    >
  > {
    const queueItems = await this.queueRepository.find({
      where: { status: QueueStatus.WAITING },
      order: { joinedAt: 'ASC' },
    });

    const grouped: Record<
      string,
      Array<{
        userId: string;
        level: string;
        topic: string;
        language: string;
        joinedAt: Date;
      }>
    > = {};

    for (const item of queueItems) {
      if (!grouped[item.level]) {
        grouped[item.level] = [];
      }
      grouped[item.level].push({
        userId: item.userId,
        level: item.level,
        topic: item.topic,
        language: item.language,
        joinedAt: item.joinedAt,
      });
    }

    return grouped;
  }

  /**
   * Finaliza uma sessão
   */
  private endSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    this.logger.log(`=== ENDING SESSION ${sessionId} ===`);

    session.status = 'ended';
    session.endTime = new Date();

    // Finaliza todas as rooms
    for (const room of session.rooms) {
      room.status = 'ended';
      room.endedAt = new Date();
      this.sessionRooms.set(room.roomName, room);

      // Remove mapeamentos de usuários
      this.userSessions.delete(room.user1);
      this.userSessions.delete(room.user2);

      this.logger.log(`Ended room: ${room.roomName}`);
    }

    this.logger.log(`Session ${sessionId} ended`);
  }

  /**
   * Agenda limpeza da fila no final do período
   */
  private scheduleQueueCleanup() {
    const now = this.getNowInBrazil();
    const currentPeriod = this.getCurrentActivePeriod(now);
    if (!currentPeriod) {
      return;
    }
    const periodEnd = new Date(now);
    periodEnd.setHours(currentPeriod.end.hour, currentPeriod.end.minute, 0, 0);

    const timeUntilEnd = periodEnd.getTime() - now.getTime();

    if (timeUntilEnd > 0 && timeUntilEnd < 5 * 60 * 1000) {
      // Se faltam menos de 5 minutos, limpa agora
      this.cleanupQueue();
    } else if (timeUntilEnd > 0) {
      // Agenda limpeza para quando faltar 1 minuto
      const cleanupTime = timeUntilEnd - 1 * 60 * 1000;

      if (this.cleanupTimer) {
        clearTimeout(this.cleanupTimer);
      }

      this.cleanupTimer = setTimeout(() => {
        this.cleanupQueue();
      }, cleanupTime);
    }
  }

  /**
   * Limpa a fila removendo todos os usuários
   */
  private async cleanupQueue() {
    const queueSize = await this.queueRepository.count({
      where: { status: QueueStatus.WAITING },
    });

    if (queueSize === 0) {
      return;
    }

    this.logger.log('=== LIMPANDO FILA (FIM DE PERÍODO) ===');
    this.logger.log(`Removendo ${queueSize} usuários da fila`);

    try {
      const queueItems = await this.queueRepository.find({
        where: { status: QueueStatus.WAITING },
      });

      const removedUsers = queueItems.map((item) => item.userId);
      await this.queueRepository.delete({ status: QueueStatus.WAITING });

      this.logger.log(
        `Fila limpa. Usuários removidos: ${removedUsers.join(', ')}`,
      );

      // Aqui poderíamos notificar os usuários removidos
      // Por enquanto, apenas logamos
    } catch (error) {
      this.logger.error('Error cleaning queue:', error);
    }
  }

  /**
   * Agenda a próxima sessão
   */
  private scheduleNextSession() {
    const now = this.getNowInBrazil();
    const totalCycle = this.SESSION_DURATION + this.WAIT_DURATION;
    const potentialNextSession = new Date(now.getTime() + totalCycle);

    // Verifica se a próxima sessão ainda está no período ativo
    if (!this.canAcceptNewSession(potentialNextSession)) {
      this.logger.log('Próxima sessão seria fora do período ativo');

      // Agenda limpeza da fila
      this.scheduleQueueCleanup();

      // Agenda para o próximo período
      const nextPeriodStart = this.getNextPeriodStartTime(now);
      const timeUntilStart = nextPeriodStart.getTime() - now.getTime();

      // Atualiza nextSessionTime para o início do próximo período
      this.nextSessionTime = null;

      this.logger.log(
        `Aguardando próximo período: ${nextPeriodStart.toISOString()}`,
      );

      this.sessionTimer = setTimeout(() => {
        this.logger.log('=== NOVO PERÍODO INICIADO ===');
        this.startSessionTimer();
      }, timeUntilStart);

      return;
    }

    // Agenda próxima sessão normalmente
    this.nextSessionTime = potentialNextSession;
    this.logger.log(
      `Próxima sessão agendada para: ${potentialNextSession.toISOString()}`,
    );

    this.sessionTimer = setTimeout(() => {
      this.createSession();
    }, totalCycle);
  }

  /**
   * Obtém informações de uma room
   */
  getSessionRoom(roomName: string): SessionRoom | null {
    return this.sessionRooms.get(roomName) || null;
  }

  /**
   * Obtém todas as sessões (para debug/admin)
   */
  async getAllSessions(): Promise<
    Array<{
      sessionId: string;
      user1Id: string;
      user2Id: string;
      roomName: string;
      level: string;
      topic: string;
      language: string;
      startedAt: Date;
      expiresAt: Date;
    }>
  > {
    const sessions = await this.sessionRepository.find({
      where: { status: SessionStatus.ACTIVE },
    });

    return sessions.map((s) => ({
      sessionId: s.sessionId,
      user1Id: s.user1Id,
      user2Id: s.user2Id,
      roomName: s.roomName,
      level: s.level,
      topic: s.topic,
      language: s.language,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
    }));
  }

  /**
   * Tenta fazer match imediato quando um usuário entra na fila
   * Usa lock para prevenir race conditions quando múltiplos usuários entram simultaneamente
   */
  private async tryImmediateMatch(level: string): Promise<void> {
    // Verifica se já há um match em andamento para este nível
    const existingLock = this.matchLocks.get(level);
    if (existingLock) {
      this.logger.log(
        `⏳ Match already in progress for level ${level}. Waiting for it to complete...`,
      );
      // Aguarda o lock atual terminar antes de tentar novamente
      await existingLock;
      // Após o lock terminar, tenta novamente (pode haver mais usuários agora)
      return this.tryImmediateMatch(level);
    }

    // Cria um novo lock (promise) para este nível
    let releaseLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.matchLocks.set(level, lockPromise);

    try {
      // Busca usuários do mesmo nível na fila
      const usersInLevel = await this.queueRepository.find({
        where: { level, status: QueueStatus.WAITING },
        order: { joinedAt: 'ASC' },
      });

      this.logger.log(
        `Checking for immediate match. Level: ${level}. Users waiting: ${usersInLevel.length}`,
      );

      // Se houver pelo menos 2 usuários, faz o match
      if (usersInLevel.length >= 2) {
        const user1 = usersInLevel[0];
        const user2 = usersInLevel[1];

        this.logger.log(
          `🎯 IMMEDIATE MATCH! Pairing ${user1.userId} with ${user2.userId}`,
        );

        const sessionId = `session_${Date.now()}`;
        const roomName = `room_${sessionId}_${level}_immediate`;

        const room: SessionRoom = {
          roomName,
          sessionId,
          user1: user1.userId,
          user2: user2.userId,
          level,
          createdAt: new Date(),
          endedAt: null,
          status: 'active',
        };

        const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

        // Salva sessão no banco usando transação para garantir atomicidade
        try {
          await this.sessionRepository.manager.transaction(
            async (transactionalEntityManager) => {
              // Salva a sessão
              await transactionalEntityManager.save(VideoCallSession, {
                sessionId,
                user1Id: user1.userId,
                user2Id: user2.userId,
                roomName,
                level,
                topic: user1.topic || 'random',
                language: user1.language || 'en',
                startedAt: new Date(),
                expiresAt,
                status: SessionStatus.ACTIVE,
              });

              // Remove ambos usuários da fila
              await transactionalEntityManager.delete(VideoCallQueue, {
                userId: user1.userId,
                status: QueueStatus.WAITING,
              });
              await transactionalEntityManager.delete(VideoCallQueue, {
                userId: user2.userId,
                status: QueueStatus.WAITING,
              });
            },
          );

          // Apenas adiciona à memória APÓS transação bem-sucedida
          this.sessionRooms.set(roomName, room);
          this.userSessions.set(user1.userId, sessionId);
          this.userSessions.set(user2.userId, sessionId);

          const session: Session = {
            sessionId,
            startTime: new Date(),
            endTime: expiresAt,
            status: 'active',
            rooms: [room],
            createdAt: new Date(),
          };
          this.sessions.set(sessionId, session);

          this.logger.log(
            `✅ Immediate match completed. Room: ${roomName}. Session expires at: ${expiresAt.toISOString()}`,
          );

          // Agenda o fim da sessão
          setTimeout(() => {
            this.endSession(sessionId);
          }, this.SESSION_DURATION);
        } catch (error) {
          this.logger.error('Error creating immediate match session:', error);
          // Em caso de erro, não adiciona nada à memória - rollback automático da transação
        }
      } else {
        this.logger.log(
          `Not enough users for immediate match (need 2, have ${usersInLevel.length})`,
        );
      }
    } finally {
      // Libera o lock SEMPRE, mesmo se houver erro
      this.matchLocks.delete(level);
      releaseLock();
    }
  }

  /**
   * Obtém toda a fila (para debug/admin)
   */
  async getQueue(): Promise<
    Array<{
      userId: string;
      level: string;
      topic: string;
      language: string;
      joinedAt: Date;
    }>
  > {
    const queueItems = await this.queueRepository.find({
      where: { status: QueueStatus.WAITING },
      order: { joinedAt: 'ASC' },
    });

    return queueItems.map((item) => ({
      userId: item.userId,
      level: item.level,
      topic: item.topic,
      language: item.language,
      joinedAt: item.joinedAt,
    }));
  }

  /**
   * Get user statistics from queue sessions
   */
  getUserSessionStatistics(userId: string): {
    totalCalls: number;
    totalDuration: number;
    sessions: SessionRoom[];
  } {
    // Get all session rooms where user participated
    const userSessionRooms = Array.from(this.sessionRooms.values()).filter(
      (room) =>
        (room.user1 === userId || room.user2 === userId) &&
        room.status === 'ended',
    );

    const totalCalls = userSessionRooms.length;

    // Each session is 10 minutes (600 seconds)
    const SESSION_DURATION_SECONDS = 10 * 60;
    const totalDuration = totalCalls * SESSION_DURATION_SECONDS;

    return {
      totalCalls,
      totalDuration,
      sessions: userSessionRooms,
    };
  }

  /**
   * ADMIN: Desabilita manualmente o sistema
   */
  manuallyDisableSystem(): { success: boolean; message: string } {
    this.logger.log('=== ADMIN: DESABILITANDO SISTEMA MANUALMENTE ===');

    this.manualOverride = true;
    this.manuallyDisabled = true;

    // Limpa a fila
    this.cleanupQueue();

    // Para os timers
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.logger.log('Sistema desabilitado manualmente');

    return {
      success: true,
      message: 'Sistema desabilitado com sucesso',
    };
  }

  /**
   * ADMIN: Habilita manualmente o sistema (volta ao modo automático)
   */
  manuallyEnableSystem(): { success: boolean; message: string } {
    this.logger.log('=== ADMIN: HABILITANDO SISTEMA MANUALMENTE ===');

    this.manualOverride = false;
    this.manuallyDisabled = false;

    // Reinicia os timers
    this.startSessionTimer();

    this.logger.log('Sistema habilitado. Voltando ao modo automático.');

    return {
      success: true,
      message: 'Sistema habilitado com sucesso',
    };
  }

  /**
   * ADMIN: Adiciona um novo período
   */
  async addCustomPeriod(
    period: ActivePeriod,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('=== ADMIN: ADICIONANDO NOVO PERÍODO ===');
    this.logger.log(
      `Período: ${period.start.hour}:${period.start.minute} - ${period.end.hour}:${period.end.minute}`,
    );

    // Validação básica
    const startMinutes = period.start.hour * 60 + period.start.minute;
    const endMinutes = period.end.hour * 60 + period.end.minute;

    if (startMinutes >= endMinutes) {
      return {
        success: false,
        message: 'Horário de início deve ser antes do horário de término',
      };
    }

    if (
      period.start.hour < 0 ||
      period.start.hour > 23 ||
      period.end.hour < 0 ||
      period.end.hour > 23
    ) {
      return {
        success: false,
        message: 'Horário inválido (0-23)',
      };
    }

    if (
      period.start.minute < 0 ||
      period.start.minute > 59 ||
      period.end.minute < 0 ||
      period.end.minute > 59
    ) {
      return {
        success: false,
        message: 'Minuto inválido (0-59)',
      };
    }

    try {
      // Obtém o próximo orderIndex
      const maxOrder = await this.periodRepository
        .createQueryBuilder('period')
        .select('MAX(period.orderIndex)', 'max')
        .getRawOne();

      const nextOrderIndex = (maxOrder?.max ?? -1) + 1;

      // Salva no banco de dados
      await this.periodRepository.save({
        startHour: period.start.hour,
        startMinute: period.start.minute,
        endHour: period.end.hour,
        endMinute: period.end.minute,
        orderIndex: nextOrderIndex,
        isActive: true,
      });

      // Recarrega períodos do banco de dados
      await this.loadPeriodsFromDatabase();

      this.logger.log(
        `Período adicionado. Total de períodos: ${this.activePeriods.length}`,
      );

      // Reinicia os timers para considerar o novo período
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
      }
      this.startSessionTimer();

      return {
        success: true,
        message: 'Período adicionado com sucesso',
      };
    } catch (error) {
      this.logger.error('Error adding period:', error);
      return {
        success: false,
        message: 'Erro ao adicionar período',
      };
    }
  }

  /**
   * ADMIN: Remove um período
   */
  async removeCustomPeriod(
    index: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log('=== ADMIN: REMOVENDO PERÍODO ===');
    this.logger.log(`Index: ${index}`);

    try {
      const periods = await this.periodRepository.find({
        where: { isActive: true },
        order: { orderIndex: 'ASC' },
      });

      if (index < 0 || index >= periods.length) {
        return {
          success: false,
          message: 'Índice inválido',
        };
      }

      const periodToRemove = periods[index];

      // Soft delete do período
      await this.periodRepository.softDelete(periodToRemove.id);

      // Recarrega períodos do banco de dados
      await this.loadPeriodsFromDatabase();

      this.logger.log(
        `Período removido: ${periodToRemove.startHour}:${periodToRemove.startMinute} - ${periodToRemove.endHour}:${periodToRemove.endMinute}`,
      );
      this.logger.log(`Períodos restantes: ${this.activePeriods.length}`);

      // Reinicia os timers
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
      }
      this.startSessionTimer();

      return {
        success: true,
        message: 'Período removido com sucesso',
      };
    } catch (error) {
      this.logger.error('Error removing period:', error);
      return {
        success: false,
        message: 'Erro ao remover período',
      };
    }
  }

  /**
   * ADMIN: Obtém estatísticas completas do sistema
   */
  async getAdminStatistics() {
    const queueSize = await this.queueRepository.count({
      where: { status: QueueStatus.WAITING },
    });
    const activeSessions = Array.from(this.sessions.values()).filter(
      (s) => s.status === 'active',
    );

    return {
      queueSize,
      activeSessionsCount: activeSessions.length,
      totalSessions: this.sessions.size,
      queueUsers: await this.getQueue(),
      activeSessions: activeSessions,
      manualOverride: this.manualOverride,
      manuallyDisabled: this.manuallyDisabled,
    };
  }

  /**
   * Obtém o status do sistema (ativo/inativo)
   */
  getSystemStatus(): {
    isActive: boolean;
    currentPeriod: ActivePeriod | null;
    nextPeriod: ActivePeriod | null;
    nextPeriodStart: Date | null;
    canAcceptSessions: boolean;
    activePeriods: ActivePeriod[];
    manualOverride: boolean;
    manuallyDisabled: boolean;
  } {
    const now = this.getNowInBrazil();
    const isActive = this.isInActivePeriod(now);
    const currentPeriod = this.getCurrentActivePeriod(now);
    const nextPeriod = this.getNextActivePeriod(now);
    const nextPeriodStart = this.getNextPeriodStartTime(now);
    const canAcceptSessions = this.canAcceptNewSession(now);

    return {
      isActive,
      currentPeriod,
      nextPeriod,
      nextPeriodStart,
      canAcceptSessions,
      activePeriods: this.activePeriods,
      manualOverride: this.manualOverride,
      manuallyDisabled: this.manuallyDisabled,
    };
  }

  /**
   * Cleanup ao destruir o serviço
   */
  onModuleDestroy() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
  }

  /**
   * Limpa a fila manualmente (para admin)
   */
  async clearQueue(): Promise<{
    success: boolean;
    message: string;
    removedCount: number;
  }> {
    try {
      const queueItems = await this.queueRepository.find({
        where: { status: QueueStatus.WAITING },
      });

      const removedCount = queueItems.length;
      const removedUsers = queueItems.map((item) => item.userId);

      await this.queueRepository.delete({ status: QueueStatus.WAITING });

      this.logger.log(`=== FILA LIMPA MANUALMENTE (ADMIN) ===`);
      this.logger.log(`Usuários removidos: ${removedUsers.join(', ')}`);

      return {
        success: true,
        message: `Queue cleared. ${removedCount} users removed.`,
        removedCount,
      };
    } catch (error) {
      this.logger.error('Error clearing queue:', error);
      return {
        success: false,
        message: 'Erro ao limpar fila',
        removedCount: 0,
      };
    }
  }
}

