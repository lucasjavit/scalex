import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { VideoCallRoom } from './entities/video-call-room.entity';

@Injectable()
export class VideoCallService {
  // In-memory storage for rooms (in production, use a database)
  private rooms: Map<string, VideoCallRoom> = new Map();

  // Generate a unique room name
  private generateRoomName(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `scalex-${timestamp}-${random}`;
  }

  // Create a new video call room
  async createRoom(createRoomDto: CreateRoomDto): Promise<VideoCallRoom> {
    const roomName = this.generateRoomName();
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
    console.log(`Created room: ${roomName}`, room);
    return room;
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

    this.rooms.set(roomName, room);
    console.log(`Ended room: ${roomName}`);

    // Clean up room after some time (optional)
    setTimeout(() => {
      this.rooms.delete(roomName);
      console.log(`Deleted room: ${roomName}`);
    }, 60000); // Delete after 1 minute

    return room;
  }

  // Get all rooms (for debugging)
  async getAllRooms(): Promise<VideoCallRoom[]> {
    return Array.from(this.rooms.values());
  }
}

