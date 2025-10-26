import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from '../services/units.service';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

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

  @Post('units')
  @Roles('admin')
  create(@Body() createUnitDto: CreateUnitDto, @CurrentUser() user: any) {
    return this.unitsService.create(createUnitDto, user.id);
  }

  @Patch('units/:id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @CurrentUser() user: any,
  ) {
    return this.unitsService.update(id, updateUnitDto, user.id);
  }

  @Delete('units/:id')
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.unitsService.remove(id, user.id);
  }
}
