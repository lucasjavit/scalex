import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinQueueDto } from './dto/join-queue.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ActivePeriod } from './entities/active-period.entity';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallService } from './video-call.service';

@Controller('video-call')
export class VideoCallController {
  constructor(
    private readonly videoCallService: VideoCallService,
    private readonly queueService: VideoCallQueueService,
  ) {}

  // POST /video-call/rooms - Create a new room
  @Post('rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    try {
      const room = await this.videoCallService.createRoom(createRoomDto);
      return {
        success: true,
        data: room,
        message: 'Room created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create room',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/rooms/available - Get all available rooms
  @Get('rooms/available')
  async getAvailableRooms() {
    try {
      const rooms = await this.videoCallService.getAvailableRooms();
      return {
        success: true,
        data: rooms,
        count: rooms.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get available rooms',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/rooms/:roomName - Get a specific room
  @Get('rooms/:roomName')
  async getRoom(@Param('roomName') roomName: string) {
    try {
      const room = await this.videoCallService.getRoom(roomName);
      if (!room) {
        throw new HttpException(
          {
            success: false,
            message: 'Room not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: room,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get room',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // PUT /video-call/rooms/:roomName/join - Join a room
  @Put('rooms/:roomName/join')
  async joinRoom(
    @Param('roomName') roomName: string,
    @Body() joinRoomDto: JoinRoomDto,
  ) {
    try {
      const room = await this.videoCallService.joinRoom(roomName, joinRoomDto);
      if (!room) {
        throw new HttpException(
          {
            success: false,
            message: 'Room not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: room,
        message: 'Joined room successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to join room',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // PUT /video-call/rooms/:roomName/start - Start a room
  @Put('rooms/:roomName/start')
  async startRoom(
    @Param('roomName') roomName: string,
    @Body() body: { userId?: string },
  ) {
    try {
      const room = await this.videoCallService.startRoom(roomName, body.userId);
      if (!room) {
        throw new HttpException(
          {
            success: false,
            message: 'Room not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: room,
        message: 'Room started successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to start room',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE /video-call/rooms/:roomName - End a room
  @Delete('rooms/:roomName')
  async endRoom(@Param('roomName') roomName: string) {
    try {
      const room = await this.videoCallService.endRoom(roomName);
      if (!room) {
        throw new HttpException(
          {
            success: false,
            message: 'Room not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: room,
        message: 'Room ended successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to end room',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/rooms - Get all rooms (for debugging)
  @Get('rooms')
  async getAllRooms() {
    try {
      const rooms = await this.videoCallService.getAllRooms();
      return {
        success: true,
        data: rooms,
        count: rooms.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get rooms',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/statistics/:userId - Get user statistics
  @Get('statistics/:userId')
  async getUserStatistics(@Param('userId') userId: string) {
    try {
      const stats = await this.videoCallService.getUserStatistics(userId);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get user statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ====== QUEUE ENDPOINTS ======

  // POST /video-call/queue/join - Join the waiting queue
  @Post('queue/join')
  async joinQueue(@Body() joinQueueDto: JoinQueueDto) {
    try {
      const result = this.queueService.joinQueue(joinQueueDto);
      return {
        success: result.success,
        message: result.message,
        data: {
          queuePosition: result.queuePosition,
          nextSessionTime: result.nextSessionTime,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to join queue',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE /video-call/queue/leave/:userId - Leave the waiting queue
  @Delete('queue/leave/:userId')
  async leaveQueue(@Param('userId') userId: string) {
    try {
      const result = this.queueService.leaveQueue(userId);
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to leave queue',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/queue/status/:userId - Get queue status for a user
  @Get('queue/status/:userId')
  async getQueueStatus(@Param('userId') userId: string) {
    try {
      const status = this.queueService.getQueueStatus(userId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get queue status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/queue - Get all users in queue (for debugging/admin)
  @Get('queue')
  async getQueue() {
    try {
      const queue = this.queueService.getQueue();
      return {
        success: true,
        data: queue,
        count: queue.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get queue',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/sessions - Get all sessions (for debugging/admin)
  @Get('sessions')
  async getSessions() {
    try {
      const sessions = this.queueService.getAllSessions();
      return {
        success: true,
        data: sessions,
        count: sessions.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get sessions',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/session-room/:roomName - Get session room details
  @Get('session-room/:roomName')
  async getSessionRoom(@Param('roomName') roomName: string) {
    try {
      const room = this.queueService.getSessionRoom(roomName);
      if (!room) {
        throw new HttpException(
          {
            success: false,
            message: 'Session room not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: room,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get session room',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/system-status - Get system status (active/inactive periods)
  @Get('system-status')
  async getSystemStatus(): Promise<{
    success: boolean;
    data: {
      isActive: boolean;
      currentPeriod: ActivePeriod | null;
      nextPeriod: ActivePeriod | null;
      nextPeriodStart: Date | null;
      canAcceptSessions: boolean;
      activePeriods: ActivePeriod[];
      manualOverride: boolean;
      manuallyDisabled: boolean;
    };
  }> {
    try {
      const status = this.queueService.getSystemStatus();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get system status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ====== ADMIN ENDPOINTS ======

  // POST /video-call/admin/disable - Manually disable system
  @Post('admin/disable')
  async adminDisableSystem() {
    try {
      const result = this.queueService.manuallyDisableSystem();
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to disable system',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /video-call/admin/enable - Manually enable system (return to auto mode)
  @Post('admin/enable')
  async adminEnableSystem() {
    try {
      const result = this.queueService.manuallyEnableSystem();
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to enable system',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/admin/statistics - Get admin statistics
  @Get('admin/statistics')
  async getAdminStatistics() {
    try {
      const stats = this.queueService.getAdminStatistics();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get admin statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /video-call/admin/add-period - Add custom period
  @Post('admin/add-period')
  async addCustomPeriod(@Body() body: { start: { hour: number; minute: number }; end: { hour: number; minute: number } }) {
    try {
      const result = this.queueService.addCustomPeriod(body);
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to add period',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DELETE /video-call/admin/remove-period/:index - Remove period
  @Delete('admin/remove-period/:index')
  async removeCustomPeriod(@Param('index') index: string) {
    try {
      const result = this.queueService.removeCustomPeriod(parseInt(index, 10));
      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to remove period',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /video-call/admin/queue/clear - Clear queue manually (admin only)
  @Post('admin/queue/clear')
  async clearQueue() {
    try {
      const result = this.queueService.clearQueue();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to clear queue',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

