import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  config: {
    max_participants?: number;
    enable_screenshare?: boolean;
    enable_chat?: boolean;
    enable_knocking?: boolean;
    exp?: number;
  };
  created_at?: string;
  privacy?: string;
}

export interface DailyToken {
  token: string;
}

@Injectable()
export class VideoCallDailyService {
  private readonly DAILY_API_KEY: string =
    process.env.DAILY_API_KEY ||
    'c1cb157a028d9a65586d6b7cc14c8d22609fc9038d82a21abcc1e55ee69499f2';
  private readonly DAILY_API_URL: string = 'https://api.daily.co/v1';
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.DAILY_API_URL,
      headers: {
        Authorization: `Bearer ${this.DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      // Timeout de 10 segundos para chamadas ao Daily.co
      timeout: 10000,
      // Pooling de conexões HTTP
      maxRedirects: 5,
      httpAgent: new (require('http').Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
        maxFreeSockets: 10,
      }),
      httpsAgent: new (require('https').Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
        maxFreeSockets: 10,
      }),
    });
  }

  /**
   * Create a Daily.co room
   * @param roomName - Unique room name (will be sanitized)
   * @param options - Room configuration options
   */
  async createRoom(
    roomName: string,
    options?: {
      maxParticipants?: number;
      enableScreenshare?: boolean;
      enableChat?: boolean;
      expiresIn?: number; // seconds
    },
  ): Promise<DailyRoom> {
    try {
      // Sanitize room name (Daily.co requires lowercase, alphanumeric, hyphens, underscores)
      const sanitizedRoomName = roomName
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .substring(0, 250); // Daily.co max length

      const expiresIn = options?.expiresIn || 3600; // Default 1 hour
      const exp = Math.floor(Date.now() / 1000) + expiresIn;

      const response = await this.axiosInstance.post<DailyRoom>('/rooms', {
        name: sanitizedRoomName,
        privacy: 'private',
        properties: {
          enable_screenshare: options?.enableScreenshare !== false,
          enable_chat: options?.enableChat !== false,
          enable_knocking: false,
          max_participants: options?.maxParticipants || 4,
          exp,
        },
      });

      console.log(
        `✅ Daily.co room created: ${response.data.name} (${response.data.id})`,
      );
      return response.data;
    } catch (error) {
      console.error(
        '❌ Error creating Daily.co room:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to create Daily.co room: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Get room details by room name or ID
   */
  async getRoom(roomNameOrId: string): Promise<DailyRoom | null> {
    try {
      const response = await this.axiosInstance.get<DailyRoom>(
        `/rooms/${roomNameOrId}`,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(
        'Error getting Daily.co room:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to get Daily.co room: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Delete a Daily.co room
   */
  async deleteRoom(roomNameOrId: string): Promise<boolean> {
    try {
      await this.axiosInstance.delete(`/rooms/${roomNameOrId}`);
      console.log(`✅ Daily.co room deleted: ${roomNameOrId}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return true; // Already deleted
      }
      console.error(
        'Error deleting Daily.co room:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to delete Daily.co room: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Create a meeting token for a user
   * @param roomName - Room name
   * @param userId - User identifier
   * @param isOwner - Whether user is room owner
   * @param expiresIn - Token expiration in seconds (default: 1 hour)
   */
  async createMeetingToken(
    roomName: string,
    userId: string,
    isOwner: boolean = false,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const exp = Math.floor(Date.now() / 1000) + expiresIn;

      const response = await this.axiosInstance.post<DailyToken>(
        '/meeting-tokens',
        {
          properties: {
            room_name: roomName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
            is_owner: isOwner,
            exp,
            user_id: userId,
          },
        },
      );

      return response.data.token;
    } catch (error) {
      console.error(
        'Error creating Daily.co meeting token:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to create Daily.co meeting token: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Get room URL (for direct joining)
   */
  getRoomUrl(roomName: string): string {
    const sanitizedRoomName = roomName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    return `https://scalex.daily.co/${sanitizedRoomName}`;
  }

  /**
   * Get all rooms from Daily.co
   * Note: This returns up to 100 rooms by default. For production with many rooms,
   * you should implement pagination using the 'limit' and 'starting_after' parameters.
   */
  async getAllRooms(): Promise<DailyRoom[]> {
    try {
      const response = await this.axiosInstance.get<{ data: DailyRoom[] }>(
        '/rooms',
        {
          params: {
            limit: 100, // Adjust as needed
          },
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error(
        'Error getting all Daily.co rooms:',
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to get all Daily.co rooms: ${error.response?.data?.error || error.message}`,
      );
    }
  }
}
