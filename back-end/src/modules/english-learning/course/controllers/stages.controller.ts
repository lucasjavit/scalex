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
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { StagesService } from '../services/stages.service';

@Controller('api/english-course/stages')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.stagesService.findAllWithProgress(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stagesService.findOne(id);
  }

  @Post()
  create(
    @Body() createStageDto: CreateStageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stagesService.create(createStageDto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.stagesService.update(id, updateStageDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.stagesService.remove(id, userId);
  }
}
