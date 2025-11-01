import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EnglishLearningAccessGuard } from '../../../common/guards/english-learning-access.guard';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ActivePeriod } from './entities/active-period.entity';
import { VideoCallDailyService } from './video-call-daily.service';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallService } from './video-call.service';

/**
 * Controller público para funcionalidades de video call acessíveis por usuários comuns
 * Rota: /api/english-learning/video-call
 * Guard: FirebaseAuthGuard + EnglishLearningAccessGuard
 */
@Controller('api/english-learning/video-call')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
export class VideoCallPublicController {
  constructor(
    private readonly queueService: VideoCallQueueService,
    private readonly videoCallService: VideoCallService,
    private readonly dailyService: VideoCallDailyService,
  ) {}

  // GET /video-call/feature-availability - Check if video call feature is available (not at usage limit)
  @Get('feature-availability')
  async getFeatureAvailability(): Promise<{
    success: boolean;
    data: {
      available: boolean;
      reason?: string;
      limits?: {
        totalRoomsCreated: number;
        maxRoomsAllowed: number;
        totalMinutesUsed: number;
        maxMinutesAllowed: number;
      };
    };
  }> {
    try {
      const stats = await this.videoCallService.getUsageStats();

      const roomsLimitReached = stats.totalRoomsCreated >= stats.maxRoomsAllowed;
      const minutesLimitReached = stats.totalMinutesUsed >= stats.maxMinutesAllowed;

      let reason: string | undefined;
      if (roomsLimitReached) {
        reason = `Room limit reached: ${stats.totalRoomsCreated}/${stats.maxRoomsAllowed} rooms created`;
      } else if (minutesLimitReached) {
        reason = `Minutes limit reached: ${stats.totalMinutesUsed}/${stats.maxMinutesAllowed} minutes used`;
      }

      return {
        success: true,
        data: {
          available: !roomsLimitReached && !minutesLimitReached,
          reason,
          limits: {
            totalRoomsCreated: stats.totalRoomsCreated,
            maxRoomsAllowed: stats.maxRoomsAllowed,
            totalMinutesUsed: stats.totalMinutesUsed,
            maxMinutesAllowed: stats.maxMinutesAllowed,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check feature availability',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/system-status - Get system status (available for all authenticated users)
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
    };
  }> {
    try {
      const status = this.queueService.getSystemStatus();
      return {
        success: true,
        data: {
          isActive: status.isActive,
          currentPeriod: status.currentPeriod,
          nextPeriod: status.nextPeriod,
          nextPeriodStart: status.nextPeriodStart,
          canAcceptSessions: status.canAcceptSessions,
          activePeriods: status.activePeriods,
          // Não expor manualOverride/manuallyDisabled (dados sensíveis de admin)
        },
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

  // GET /video-call/statistics/:userId - Get user call statistics
  @Get('statistics/:userId')
  async getCallStatistics(@Param('userId') userId: string) {
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
          message: 'Failed to fetch call statistics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /video-call/queue/join - Join the queue
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Post('queue/join')
  async joinQueue(@Body() joinQueueDto: JoinQueueDto) {
    try {
      const result = await this.queueService.joinQueue(joinQueueDto);
      return result;
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

  // DELETE /video-call/queue/leave/:userId - Leave the queue
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Delete('queue/leave/:userId')
  async leaveQueue(@Param('userId') userId: string) {
    // Validate userId
    if (!userId || userId.trim().length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'User ID is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.queueService.leaveQueue(userId);
      return result;
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

  // DELETE /video-call/session/leave/:userId - Leave current session
  @Delete('session/leave/:userId')
  async leaveSession(
    @Param('userId') userId: string,
    @Query('shouldRejoinQueue') shouldRejoinQueue?: string,
  ) {
    // Validate userId
    if (!userId || userId.trim().length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'User ID is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const rejoinQueue = shouldRejoinQueue === 'true';
      const result = await this.queueService.leaveSession(userId, rejoinQueue);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to leave session',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /video-call/queue/status/:userId - Get queue status for user
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute (higher limit for polling)
  @Get('queue/status/:userId')
  async getQueueStatus(@Param('userId') userId: string) {
    try {
      const status = await this.queueService.getQueueStatus(userId);
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

  // GET /video-call/session/check/:userId - Check if user session is still active
  @Get('session/check/:userId')
  async checkSessionStatus(@Param('userId') userId: string) {
    try {
      const isActive = this.queueService.isUserInActiveSession(userId);
      return {
        success: true,
        data: {
          isActive,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to check session status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /video-call/daily/token - Generate Daily.co access token for a room
  @Post('daily/token')
  async generateDailyToken(
    @Body() body: { roomName: string; userId: string; isOwner?: boolean },
  ) {
    // Validate required fields
    if (!body.roomName || body.roomName.trim().length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'Room name is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!body.userId || body.userId.trim().length === 0) {
      throw new HttpException(
        {
          success: false,
          message: 'User ID is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate roomName format (max 250 chars for Daily.co)
    if (body.roomName.length > 250) {
      throw new HttpException(
        {
          success: false,
          message: 'Room name must not exceed 250 characters',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const token = await this.dailyService.createMeetingToken(
        body.roomName,
        body.userId,
        body.isOwner || false,
        3600, // 1 hour
      );
      return {
        success: true,
        data: {
          token,
          roomUrl: this.dailyService.getRoomUrl(body.roomName),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to generate Daily.co token',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
