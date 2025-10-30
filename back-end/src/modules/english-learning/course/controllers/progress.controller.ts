import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateWatchTimeDto } from '../dto/update-watch-time.dto';
import { ProgressService } from '../services/progress.service';
import { FirebaseAuthGuard } from '../../../../common/guards/firebase-auth.guard';
import { EnglishLearningAccessGuard } from '../../../../common/guards/english-learning-access.guard';

@Controller('api/english-course/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Helper method to get userId from request (headers or user object)
  private getUserId(request: any): string {
    // Try to get from user object (if authenticated)
    if (request?.user?.id) {
      return request.user.id;
    }
    // Try to get from headers
    const userId = request?.headers?.['x-user-id'];
    if (userId) {
      return userId;
    }
    // Throw error if userId is not found - this should not happen in production
    throw new Error('UserId not found. User must be authenticated.');
  }

  @Get('dashboard')
  getDashboard(@Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.getDashboardStats(userId);
  }

  @Get('stages/:stageId')
  getStageProgress(@Param('stageId') stageId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Post('stages/:stageId/start')
  startStage(@Param('stageId') stageId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.startStage(userId, stageId);
  }

  @Get('units/:unitId')
  getUnitProgress(@Param('unitId') unitId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.getUnitProgress(userId, unitId);
  }

  @Post('units/:unitId/start')
  async startUnit(@Param('unitId') unitId: string, @Req() request: any) {
    try {
      const userId = this.getUserId(request);
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
    @Req() request: any,
  ) {
    const userId = this.getUserId(request);
    return this.progressService.updateWatchTime(
      userId,
      unitId,
      updateWatchTimeDto.watchTimeSeconds,
    );
  }

  @Post('units/:unitId/complete')
  completeUnit(@Param('unitId') unitId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.completeUnit(userId, unitId);
  }

  @Post('units/:unitId/skip')
  skipUnit(@Param('unitId') unitId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.progressService.skipUnit(userId, unitId);
  }

  // Admin endpoints to get any user's progress
  @Get('users/:userId/stages/:stageId')
  getStageProgressByUser(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Get('users/:userId/units/:unitId')
  getUnitProgressByUser(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.getUnitProgress(userId, unitId);
  }

  // Admin management endpoints
  @Post('admin/users/:userId/reset')
  @UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
  resetUserProgress(@Param('userId') userId: string) {
    return this.progressService.resetUserProgress(userId);
  }

  @Delete('admin/users/:userId/stages/:stageId')
  @UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
  deleteStageProgress(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.deleteStageProgress(userId, stageId);
  }

  @Delete('admin/users/:userId/units/:unitId')
  @UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
  deleteUnitProgress(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.deleteUnitProgress(userId, unitId);
  }

  @Post('admin/users/:userId/units/:unitId/force-complete')
  @UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
  forceCompleteUnit(
    @Param('userId') userId: string,
    @Param('unitId') unitId: string,
  ) {
    return this.progressService.forceCompleteUnit(userId, unitId);
  }

  @Post('admin/users/:userId/stages/:stageId/force-complete')
  @UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
  forceCompleteStage(
    @Param('userId') userId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.progressService.forceCompleteStage(userId, stageId);
  }
}
