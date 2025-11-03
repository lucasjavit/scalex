import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UpdateWatchTimeDto } from '../dto/update-watch-time.dto';
import { ProgressService } from '../services/progress.service';
import { FirebaseAuthGuard } from '../../../../common/guards/firebase-auth.guard';
import { EnglishLearningAccessGuard } from '../../../../common/guards/english-learning-access.guard';

@Controller('english-course/progress')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.progressService.getDashboardStats(userId);
  }

  @Get('stages/:stageId')
  getStageProgress(
    @Param('stageId') stageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Post('stages/:stageId/start')
  startStage(
    @Param('stageId') stageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.startStage(userId, stageId);
  }

  @Get('units/:unitId')
  getUnitProgress(
    @Param('unitId') unitId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.getUnitProgress(userId, unitId);
  }

  @Post('units/:unitId/start')
  async startUnit(
    @Param('unitId') unitId: string,
    @CurrentUser('id') userId: string,
  ) {
    try {
      console.log('🚀 Starting unit:', { userId, unitId });
      const result = await this.progressService.startUnit(userId, unitId);
      console.log('✅ Unit started successfully');
      return result;
    } catch (error) {
      console.error('❌ Error starting unit:', error);
      throw error;
    }
  }

  @Patch('units/:unitId/watch-time')
  updateWatchTime(
    @Param('unitId') unitId: string,
    @Body() updateWatchTimeDto: UpdateWatchTimeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.updateWatchTime(
      userId,
      unitId,
      updateWatchTimeDto.watchTimeSeconds,
    );
  }

  @Post('units/:unitId/complete')
  completeUnit(
    @Param('unitId') unitId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.progressService.completeUnit(userId, unitId);
  }

  @Post('units/:unitId/skip')
  skipUnit(@Param('unitId') unitId: string, @CurrentUser('id') userId: string) {
    return this.progressService.skipUnit(userId, unitId);
  }

  // Admin endpoints to get any user's progress
  @Get('users/:userId/stages/:stageId')
  @UseGuards(EnglishLearningAccessGuard)
  getStageProgressByUser(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Get('users/:userId/units/:unitId')
  @UseGuards(EnglishLearningAccessGuard)
  getUnitProgressByUser(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.getUnitProgress(userId, unitId);
  }

  // Admin management endpoints
  @Post('admin/users/:userId/reset')
  @UseGuards(EnglishLearningAccessGuard)
  resetUserProgress(@Param('userId') userId: string) {
    return this.progressService.resetUserProgress(userId);
  }

  @Delete('admin/users/:userId/stages/:stageId')
  @UseGuards(EnglishLearningAccessGuard)
  deleteStageProgress(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.deleteStageProgress(userId, stageId);
  }

  @Delete('admin/users/:userId/units/:unitId')
  @UseGuards(EnglishLearningAccessGuard)
  deleteUnitProgress(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.deleteUnitProgress(userId, unitId);
  }

  @Post('admin/users/:userId/units/:unitId/force-complete')
  @UseGuards(EnglishLearningAccessGuard)
  forceCompleteUnit(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.forceCompleteUnit(userId, unitId);
  }

  @Post('admin/users/:userId/stages/:stageId/force-complete')
  @UseGuards(EnglishLearningAccessGuard)
  forceCompleteStage(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.forceCompleteStage(userId, stageId);
  }
}
