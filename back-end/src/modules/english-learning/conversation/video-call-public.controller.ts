import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ActivePeriod } from './entities/active-period.entity';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallService } from './video-call.service';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { EnglishLearningAccessGuard } from '../../../common/guards/english-learning-access.guard';

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
  ) {}

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
  @Delete('queue/leave/:userId')
  async leaveQueue(@Param('userId') userId: string) {
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

  // GET /video-call/queue/status/:userId - Get queue status for user
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
}
