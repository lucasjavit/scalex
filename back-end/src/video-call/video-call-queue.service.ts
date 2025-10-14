import { Injectable, Logger } from '@nestjs/common';
import { JoinQueueDto } from './dto/join-queue.dto';
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
  private nextSessionTime: Date | null = null;
  private readonly SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in ms
  private readonly WAIT_DURATION = 2 * 60 * 1000; // 2 minutes in ms

  constructor() {
    this.startSessionTimer();
  }

  /**
   * Adiciona um usuário à fila
   */
  joinQueue(dto: JoinQueueDto): { success: boolean; message: string; queuePosition: number; nextSessionTime: Date | null } {
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
    // Calcula o tempo até a próxima sessão (alinhado a cada 10 minutos)
    const now = new Date();
    const minutes = now.getMinutes();
    const nextMinute = Math.ceil((minutes + 1) / 10) * 10;
    const nextSession = new Date(now);
    nextSession.setMinutes(nextMinute, 0, 0);
    
    if (nextSession <= now) {
      nextSession.setMinutes(nextSession.getMinutes() + 10);
    }
    
    this.nextSessionTime = nextSession;
    const timeUntilNextSession = nextSession.getTime() - now.getTime();

    this.logger.log(`Next session scheduled at ${nextSession.toISOString()}`);
    this.logger.log(`Time until next session: ${Math.round(timeUntilNextSession / 1000)}s`);

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
   * Agenda a próxima sessão
   */
  private scheduleNextSession() {
    // Próxima sessão = SESSION_DURATION + WAIT_DURATION
    const totalCycle = this.SESSION_DURATION + this.WAIT_DURATION;
    const nextSession = new Date(Date.now() + totalCycle);
    this.nextSessionTime = nextSession;

    this.logger.log(`Next session scheduled at ${nextSession.toISOString()}`);

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
   * Cleanup ao destruir o serviço
   */
  onModuleDestroy() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
  }
}

