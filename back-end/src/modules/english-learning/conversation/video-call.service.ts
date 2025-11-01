import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { VideoCallRoom } from './entities/video-call-room.entity';
import { VideoCallDailyService } from './video-call-daily.service';
import { VideoCallQueueService } from './video-call-queue.service';

@Injectable()
export class VideoCallService {
  // In-memory storage for rooms (in production, use a database)
  private rooms: Map<string, VideoCallRoom> = new Map();

  constructor(
    private readonly queueService: VideoCallQueueService,
    private readonly dailyService: VideoCallDailyService,
  ) {}

  // Generate a unique room name
  private generateRoomName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `scalex-${timestamp}-${random}`;
  }

  // Create a new video call room
  async createRoom(
    createRoomDto: CreateRoomDto,
  ): Promise<VideoCallRoom & { dailyRoomUrl: string; dailyRoomId: string }> {
    const roomName = this.generateRoomName();

    // Create Daily.co room
    const dailyRoom = await this.dailyService.createRoom(roomName, {
      maxParticipants: 4,
      enableScreenshare: true,
      enableChat: true,
      expiresIn: 3600 * (createRoomDto.duration || 1), // Expires based on duration
    });

    const room: VideoCallRoom = {
      roomName,
      userId: createRoomDto.userId,
      createdBy: createRoomDto.userId,
      participants: [createRoomDto.userId],
      preferences: {
        topic: createRoomDto.topic || 'random',
        language: createRoomDto.language || 'en',
        level: createRoomDto.level || 'intermediate',
        duration: createRoomDto.duration || 1,
      },
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
      status: 'waiting',
      duration: 0,
    };

    this.rooms.set(roomName, room);
    console.log(
      `Created room: ${roomName} with Daily.co room: ${dailyRoom.id}`,
    );

    return {
      ...room,
      dailyRoomUrl: dailyRoom.url,
      dailyRoomId: dailyRoom.id,
    };
  }

  // Get all available rooms (status: waiting)
  async getAvailableRooms(): Promise<VideoCallRoom[]> {
    const availableRooms = Array.from(this.rooms.values()).filter(
      (room) => room.status === 'waiting',
    );
    console.log(`Found ${availableRooms.length} available rooms`);
    return availableRooms;
  }

  // Get a specific room by name
  async getRoom(roomName: string): Promise<VideoCallRoom | null> {
    const room = this.rooms.get(roomName);
    return room || null;
  }

  // Join a room
  async joinRoom(
    roomName: string,
    joinRoomDto: JoinRoomDto,
  ): Promise<VideoCallRoom | null> {
    const room = this.rooms.get(roomName);
    if (!room) {
      return null;
    }

    // Only allow joining if room is waiting
    if (room.status !== 'waiting') {
      throw new Error('Room is not available for joining');
    }

    // Add user to participants
    if (!room.participants.includes(joinRoomDto.userId)) {
      room.participants.push(joinRoomDto.userId);
    }

    // Update room status to active
    room.status = 'active';
    room.startedAt = new Date().toISOString();

    this.rooms.set(roomName, room);
    console.log(`User ${joinRoomDto.userId} joined room: ${roomName}`);
    return room;
  }

  // Start a room (mark as active if not already)
  async startRoom(
    roomName: string,
    userId?: string,
  ): Promise<VideoCallRoom | null> {
    const room = this.rooms.get(roomName);
    if (!room) {
      return null;
    }

    // Add user to participants if provided and not already in the list
    if (userId && !room.participants.includes(userId)) {
      room.participants.push(userId);
      console.log(`User ${userId} added to room ${roomName} participants`);
    }

    // Only update if not already started
    if (!room.startedAt && room.status === 'waiting') {
      room.status = 'active';
      room.startedAt = new Date().toISOString();
      this.rooms.set(roomName, room);
      console.log(`Room ${roomName} started at ${room.startedAt}`);
    } else if (userId) {
      // Just update participants if room already started
      this.rooms.set(roomName, room);
    }

    return room;
  }

  // End a room
  async endRoom(roomName: string): Promise<VideoCallRoom | null> {
    const room = this.rooms.get(roomName);
    if (!room) {
      return null;
    }

    room.status = 'ended';
    room.endedAt = new Date().toISOString();

    // Calculate duration
    if (room.startedAt) {
      const start = new Date(room.startedAt);
      const end = new Date(room.endedAt);
      room.duration = Math.round((end.getTime() - start.getTime()) / 1000);
    }

    // Delete Daily.co room (optional - Daily.co will auto-delete after expiration)
    try {
      await this.dailyService.deleteRoom(roomName);
    } catch (error) {
      console.warn(
        `Could not delete Daily.co room ${roomName}:`,
        error.message,
      );
    }

    this.rooms.set(roomName, room);
    console.log(`Ended room: ${roomName}, Duration: ${room.duration}s`);

    // Keep room in memory for statistics (delete after 24 hours)
    setTimeout(
      () => {
        this.rooms.delete(roomName);
        console.log(`Deleted room from memory: ${roomName}`);
      },
      24 * 60 * 60 * 1000,
    ); // Delete after 24 hours

    return room;
  }

  // Get all rooms (for debugging)
  async getAllRooms(): Promise<VideoCallRoom[]> {
    return Array.from(this.rooms.values());
  }

  // Get user statistics (combines manual rooms + queue sessions)
  async getUserStatistics(userId: string): Promise<{
    totalCalls: number;
    totalDuration: number;
    totalDurationFormatted: string;
    averageDuration: number;
    averageDurationFormatted: string;
    lastCall: string | null;
    thisWeekCalls: number;
    thisMonthCalls: number;
  }> {
    // Get statistics from manual rooms (Create Room / Join Room)
    const manualRooms = Array.from(this.rooms.values()).filter(
      (room) =>
        room.participants.includes(userId) &&
        room.status === 'ended' &&
        room.duration > 0,
    );

    // Get statistics from queue sessions (Find Partner)
    const queueStats = this.queueService.getUserSessionStatistics(userId);

    // Combine both statistics
    const manualCalls = manualRooms.length;
    const manualDuration = manualRooms.reduce(
      (sum, room) => sum + room.duration,
      0,
    );

    const totalCalls = manualCalls + queueStats.totalCalls;
    const totalDuration = manualDuration + queueStats.totalDuration;
    const averageDuration =
      totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    // Format duration
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    };

    // Get last call from both sources
    const allEndedDates: Date[] = [];

    // Add manual room dates
    manualRooms.forEach((room) => {
      if (room.endedAt) {
        allEndedDates.push(new Date(room.endedAt));
      }
    });

    // Add queue session dates
    queueStats.sessions.forEach((session) => {
      if (session.endedAt) {
        allEndedDates.push(new Date(session.endedAt));
      }
    });

    // Sort and get most recent
    allEndedDates.sort((a, b) => b.getTime() - a.getTime());
    const lastCall =
      allEndedDates.length > 0 ? allEndedDates[0].toISOString() : null;

    // Get calls from this week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const manualWeekCalls = manualRooms.filter(
      (room) => room.endedAt && new Date(room.endedAt) >= oneWeekAgo,
    ).length;

    const queueWeekCalls = queueStats.sessions.filter(
      (session) => session.endedAt && new Date(session.endedAt) >= oneWeekAgo,
    ).length;

    const thisWeekCalls = manualWeekCalls + queueWeekCalls;

    // Get calls from this month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const manualMonthCalls = manualRooms.filter(
      (room) => room.endedAt && new Date(room.endedAt) >= firstDayOfMonth,
    ).length;

    const queueMonthCalls = queueStats.sessions.filter(
      (session) =>
        session.endedAt && new Date(session.endedAt) >= firstDayOfMonth,
    ).length;

    const thisMonthCalls = manualMonthCalls + queueMonthCalls;

    console.log(`=== USER STATISTICS for ${userId} ===`);
    console.log(`Manual Rooms: ${manualCalls} calls, ${manualDuration}s`);
    console.log(
      `Queue Sessions: ${queueStats.totalCalls} calls, ${queueStats.totalDuration}s`,
    );
    console.log(`Total: ${totalCalls} calls, ${totalDuration}s`);

    return {
      totalCalls,
      totalDuration,
      totalDurationFormatted: formatDuration(totalDuration),
      averageDuration,
      averageDurationFormatted: formatDuration(averageDuration),
      lastCall,
      thisWeekCalls,
      thisMonthCalls,
    };
  }
}
