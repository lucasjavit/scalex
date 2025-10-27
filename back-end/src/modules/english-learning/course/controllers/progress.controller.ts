import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { UpdateWatchTimeDto } from '../dto/update-watch-time.dto';
import { ProgressService } from '../services/progress.service';

@Controller('api/english-course/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard() {
    // TODO: Get userId from authenticated user
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.getDashboardStats(userId);
  }

  @Get('stages/:stageId')
  getStageProgress(@Param('stageId') stageId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Post('stages/:stageId/start')
  startStage(@Param('stageId') stageId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.startStage(userId, stageId);
  }

  @Get('units/:unitId')
  getUnitProgress(@Param('unitId') unitId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.getUnitProgress(userId, unitId);
  }

  @Post('units/:unitId/start')
  startUnit(@Param('unitId') unitId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.startUnit(userId, unitId);
  }

  @Patch('units/:unitId/watch-time')
  updateWatchTime(
    @Param('unitId') unitId: string,
    @Body() updateWatchTimeDto: UpdateWatchTimeDto,
  ) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.updateWatchTime(
      userId,
      unitId,
      updateWatchTimeDto.watchTimeSeconds,
    );
  }

  @Post('units/:unitId/complete')
  completeUnit(@Param('unitId') unitId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.completeUnit(userId, unitId);
  }

  @Post('units/:unitId/skip')
  skipUnit(@Param('unitId') unitId: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.progressService.skipUnit(userId, unitId);
  }

  // Admin endpoints to get any user's progress
  @Get('users/:userId/stages/:stageId')
  getStageProgressByUser(@Param('userId') userId: string, @Param('stageId') stageId: string) {
    return this.progressService.getStageProgress(userId, stageId);
  }

  @Get('users/:userId/units/:unitId')
  getUnitProgressByUser(@Param('userId') userId: string, @Param('unitId') unitId: string) {
    return this.progressService.getUnitProgress(userId, unitId);
  }

  // Admin management endpoints
  @Post('admin/users/:userId/reset')
  resetUserProgress(@Param('userId') userId: string) {
    return this.progressService.resetUserProgress(userId);
  }

  @Delete('admin/users/:userId/stages/:stageId')
  deleteStageProgress(@Param('userId') userId: string, @Param('stageId') stageId: string) {
    return this.progressService.deleteStageProgress(userId, stageId);
  }

  @Delete('admin/users/:userId/units/:unitId')
  deleteUnitProgress(@Param('userId') userId: string, @Param('unitId') unitId: string) {
    return this.progressService.deleteUnitProgress(userId, unitId);
  }

  @Post('admin/users/:userId/units/:unitId/force-complete')
  forceCompleteUnit(@Param('userId') userId: string, @Param('unitId') unitId: string) {
    return this.progressService.forceCompleteUnit(userId, unitId);
  }

  @Post('admin/users/:userId/stages/:stageId/force-complete')
  forceCompleteStage(@Param('userId') userId: string, @Param('stageId') stageId: string) {
    return this.progressService.forceCompleteStage(userId, stageId);
  }
}
