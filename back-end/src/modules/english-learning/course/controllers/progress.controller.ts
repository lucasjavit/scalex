import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ProgressService } from '../services/progress.service';
import { UpdateWatchTimeDto } from '../dto/update-watch-time.dto';

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
}
