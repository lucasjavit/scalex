import { Injectable, Logger } from '@nestjs/common';
import { toZonedTime } from 'date-fns-tz';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ActivePeriod } from './entities/active-period.entity';
import { QueueUser } from './entities/queue-user.entity';
import { SessionRoom } from './entities/session-room.entity';
import { Session } from './entities/session.entity';

@Injectable()
export class VideoCallQueueService {
  private readonly logger = new Logger(VideoCallQueueService.name);
  
  // In-memory storage
  private queue: Map<string, QueueUser> = new Map(); // userId -> QueueUser
  private sessions: Map<string, Session> = new Map(); // sessionId -> Session
  private userSessions: Map<string, string> = new Map(); // userId -> sessionId
  private sessionRooms: Map<string, SessionRoom> = new Map(); // roomName -> SessionRoom
  
  private sessionTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private nextSessionTime: Date | null = null;
  private readonly SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms
  private readonly WAIT_DURATION = 2 * 60 * 1000; // 2 minutes in ms
  private readonly TIMEZONE = 'America/Sao_Paulo';
  
  // Manual override controls
  private manualOverride: boolean = false; // true = force disable, false = follow schedule
  private manuallyDisabled: boolean = false;
  
  // Horários programados (Brasília) - agora podem ser modificados
  private activePeriods: ActivePeriod[] = [
    { start: { hour: 7, minute: 0 }, end: { hour: 9, minute: 30 } },   // Manhã
    { start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 0 } },  // Almoço
    { start: { hour: 15, minute: 0 }, end: { hour: 16, minute: 0 } },  // Tarde
    { start: { hour: 19, minute: 0 }, end: { hour: 20, minute: 0 } },  // Noite 1
    { start: { hour: 21, minute: 0 }, end: { hour: 22, minute: 30 } }, // Noite 2
  ];

  constructor() {
    this.startSessionTimer();
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
      this.logger.log(`🕐 Horário Brasil: ${brazilNow.toLocaleString('pt-BR', { timeZone: this.TIMEZONE })}`);
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
  joinQueue(dto: JoinQueueDto): { success: boolean; message: string; queuePosition: number; nextSessionTime: Date | null } {
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
    if (this.queue.has(dto.userId)) {
      return {
        success: false,
        message: 'Você já está na fila',
        queuePosition: this.getQueuePosition(dto.userId),
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

    const queueUser: QueueUser = {
      userId: dto.userId,
      level: dto.level,
      preferences: {
        topic: dto.topic,
        language: dto.language,
      },
      joinedAt: new Date(),
    };

    this.queue.set(dto.userId, queueUser);
    this.logger.log(`User ${dto.userId} joined queue. Level: ${dto.level}. Queue size: ${this.queue.size}`);

    return {
      success: true,
      message: 'Você entrou na fila com sucesso',
      queuePosition: this.getQueuePosition(dto.userId),
      nextSessionTime: this.nextSessionTime,
    };
  }

  /**
   * Remove um usuário da fila
   */
  leaveQueue(userId: string): { success: boolean; message: string } {
    if (!this.queue.has(userId)) {
      return {
        success: false,
        message: 'Você não está na fila',
      };
    }

    this.queue.delete(userId);
    this.logger.log(`User ${userId} left queue. Queue size: ${this.queue.size}`);

    return {
      success: true,
      message: 'Você saiu da fila',
    };
  }

  /**
   * Obtém o status da fila para um usuário
   */
  getQueueStatus(userId: string) {
    const inQueue = this.queue.has(userId);
    const queuePosition = inQueue ? this.getQueuePosition(userId) : -1;
    const queueSize = this.queue.size;
    
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
          room => room.user1 === userId || room.user2 === userId
        );
        
        if (userRoom) {
          currentSession = {
            sessionId: session.sessionId,
            roomName: userRoom.roomName,
            partner: userRoom.user1 === userId ? userRoom.user2 : userRoom.user1,
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
  private getQueuePosition(userId: string): number {
    const queueArray = Array.from(this.queue.values()).sort(
      (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
    );
    return queueArray.findIndex(user => user.userId === userId) + 1;
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

      this.logger.log(`Sistema INATIVO. Próximo período: ${nextPeriodStart.toISOString()}`);
      this.logger.log(`Aguardando ${Math.round(timeUntilStart / 1000 / 60)} minutos`);

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
    this.logger.log(`Tempo até próxima sessão: ${Math.round(timeUntilNextSession / 1000)}s`);

    this.sessionTimer = setTimeout(() => {
      this.createSession();
    }, timeUntilNextSession);
  }

  /**
   * Cria uma nova sessão com os usuários da fila
   */
  private createSession() {
    this.logger.log('=== CREATING NEW SESSION ===');
    this.logger.log(`Queue size: ${this.queue.size}`);

    if (this.queue.size < 2) {
      this.logger.log('Not enough users in queue (need at least 2). Skipping session.');
      this.scheduleNextSession();
      return;
    }

    // Agrupa usuários por nível
    const usersByLevel = this.groupUsersByLevel();
    
    const sessionId = `session_${Date.now()}`;
    const sessionRooms: SessionRoom[] = [];

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

        sessionRooms.push(room);
        this.sessionRooms.set(roomName, room);
        this.userSessions.set(user1.userId, sessionId);
        this.userSessions.set(user2.userId, sessionId);
        
        // Remove da fila
        this.queue.delete(user1.userId);
        this.queue.delete(user2.userId);

        this.logger.log(`Created room: ${roomName} for users ${user1.userId} and ${user2.userId}`);
      }

      // Remove usuários ímpares da fila (eles precisarão clicar novamente)
      if (users.length % 2 !== 0) {
        const oddUser = users[users.length - 1];
        this.queue.delete(oddUser.userId);
        this.logger.log(`Removed odd user ${oddUser.userId} from queue`);
      }
    }

    if (sessionRooms.length === 0) {
      this.logger.log('No rooms created. Skipping session.');
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
    this.logger.log(`Session ${sessionId} created with ${sessionRooms.length} rooms`);
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
  private groupUsersByLevel(): Record<string, QueueUser[]> {
    const grouped: Record<string, QueueUser[]> = {};
    
    for (const user of this.queue.values()) {
      if (!grouped[user.level]) {
        grouped[user.level] = [];
      }
      grouped[user.level].push(user);
    }

    // Ordena por tempo de entrada (FIFO)
    for (const level in grouped) {
      grouped[level].sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
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
  private cleanupQueue() {
    if (this.queue.size === 0) {
      return;
    }

    this.logger.log('=== LIMPANDO FILA (FIM DE PERÍODO) ===');
    this.logger.log(`Removendo ${this.queue.size} usuários da fila`);

    const removedUsers = Array.from(this.queue.keys());
    this.queue.clear();

    this.logger.log(`Fila limpa. Usuários removidos: ${removedUsers.join(', ')}`);
    
    // Aqui poderíamos notificar os usuários removidos
    // Por enquanto, apenas logamos
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

      this.logger.log(`Aguardando próximo período: ${nextPeriodStart.toISOString()}`);

      this.sessionTimer = setTimeout(() => {
        this.logger.log('=== NOVO PERÍODO INICIADO ===');
        this.startSessionTimer();
      }, timeUntilStart);

      return;
    }

    // Agenda próxima sessão normalmente
    this.nextSessionTime = potentialNextSession;
    this.logger.log(`Próxima sessão agendada para: ${potentialNextSession.toISOString()}`);

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
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Obtém toda a fila (para debug/admin)
   */
  getQueue(): QueueUser[] {
    return Array.from(this.queue.values()).sort(
      (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
    );
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
        (room.user1 === userId || room.user2 === userId) && room.status === 'ended',
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
  addCustomPeriod(period: ActivePeriod): { success: boolean; message: string } {
    this.logger.log('=== ADMIN: ADICIONANDO NOVO PERÍODO ===');
    this.logger.log(`Período: ${period.start.hour}:${period.start.minute} - ${period.end.hour}:${period.end.minute}`);
    
    // Validação básica
    const startMinutes = period.start.hour * 60 + period.start.minute;
    const endMinutes = period.end.hour * 60 + period.end.minute;
    
    if (startMinutes >= endMinutes) {
      return {
        success: false,
        message: 'Horário de início deve ser antes do horário de término',
      };
    }
    
    if (period.start.hour < 0 || period.start.hour > 23 || period.end.hour < 0 || period.end.hour > 23) {
      return {
        success: false,
        message: 'Horário inválido (0-23)',
      };
    }
    
    if (period.start.minute < 0 || period.start.minute > 59 || period.end.minute < 0 || period.end.minute > 59) {
      return {
        success: false,
        message: 'Minuto inválido (0-59)',
      };
    }
    
    // Adiciona o período
    this.activePeriods.push(period);
    
    // Ordena por horário de início
    this.activePeriods.sort((a, b) => {
      const aStart = a.start.hour * 60 + a.start.minute;
      const bStart = b.start.hour * 60 + b.start.minute;
      return aStart - bStart;
    });
    
    this.logger.log(`Período adicionado. Total de períodos: ${this.activePeriods.length}`);
    
    // Reinicia os timers para considerar o novo período
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    this.startSessionTimer();
    
    return {
      success: true,
      message: 'Período adicionado com sucesso',
    };
  }

  /**
   * ADMIN: Remove um período
   */
  removeCustomPeriod(index: number): { success: boolean; message: string } {
    this.logger.log('=== ADMIN: REMOVENDO PERÍODO ===');
    this.logger.log(`Index: ${index}`);
    
    if (index < 0 || index >= this.activePeriods.length) {
      return {
        success: false,
        message: 'Índice inválido',
      };
    }
    
    const removedPeriod = this.activePeriods[index];
    this.activePeriods.splice(index, 1);
    
    this.logger.log(`Período removido: ${removedPeriod.start.hour}:${removedPeriod.start.minute} - ${removedPeriod.end.hour}:${removedPeriod.end.minute}`);
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
  }

  /**
   * ADMIN: Obtém estatísticas completas do sistema
   */
  getAdminStatistics(): {
    queueSize: number;
    activeSessionsCount: number;
    totalSessions: number;
    queueUsers: QueueUser[];
    activeSessions: Session[];
    manualOverride: boolean;
    manuallyDisabled: boolean;
  } {
    const activeSessions = Array.from(this.sessions.values()).filter(
      (s) => s.status === 'active',
    );

    return {
      queueSize: this.queue.size,
      activeSessionsCount: activeSessions.length,
      totalSessions: this.sessions.size,
      queueUsers: this.getQueue(),
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
  clearQueue(): { success: boolean; message: string; removedCount: number } {
    const removedCount = this.queue.size;
    const removedUsers = Array.from(this.queue.keys());
    
    this.queue.clear();
    
    this.logger.log(`=== FILA LIMPA MANUALMENTE (ADMIN) ===`);
    this.logger.log(`Usuários removidos: ${removedUsers.join(', ')}`);
    
    return {
      success: true,
      message: `Queue cleared. ${removedCount} users removed.`,
      removedCount
    };
  }
}

