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
import { FirebaseAuthGuard } from '../../../../common/guards/firebase-auth.guard';
import { EnglishLearningAccessGuard } from '../../../../common/guards/english-learning-access.guard';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { UnitsService } from '../services/units.service';

@Controller('api/english-course')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get('stages/:stageId/units')
  findByStage(
    @Param('stageId') stageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.unitsService.findByStageWithProgress(stageId, userId);
  }

  @Get('units/:id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post('units')
  create(
    @Body() createUnitDto: CreateUnitDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.unitsService.create(createUnitDto, userId);
  }

  @Patch('units/:id')
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.unitsService.update(id, updateUnitDto, userId);
  }

  @Delete('units/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.unitsService.remove(id, userId);
  }
}
