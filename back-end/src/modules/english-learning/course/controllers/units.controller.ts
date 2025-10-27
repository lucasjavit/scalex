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
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { UnitsService } from '../services/units.service';

@Controller('api/english-course')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Public()
  @Get('stages/:stageId/units')
  findByStage(@Param('stageId') stageId: string) {
    // TODO: Get userId from authenticated user
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.unitsService.findByStageWithProgress(stageId, userId);
  }

  @Public()
  @Get('units/:id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Public()
  @Post('units')
  create(@Body() createUnitDto: CreateUnitDto) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.unitsService.create(createUnitDto, userId);
  }

  @Public()
  @Patch('units/:id')
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.unitsService.update(id, updateUnitDto, userId);
  }

  @Public()
  @Delete('units/:id')
  remove(@Param('id') id: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.unitsService.remove(id, userId);
  }
}
