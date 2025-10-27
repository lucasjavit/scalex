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
import { Public } from '../../../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { StagesService } from '../services/stages.service';

@Controller('api/english-course/stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Public()
  @Get()
  findAll() {
    // TODO: Get userId from authenticated user
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.stagesService.findAllWithProgress(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stagesService.findOne(id);
  }

  @Public()
  @Post()
  create(@Body() createStageDto: CreateStageDto) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.stagesService.create(createStageDto, userId);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.stagesService.update(id, updateStageDto, userId);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.stagesService.remove(id, userId);
  }
}
