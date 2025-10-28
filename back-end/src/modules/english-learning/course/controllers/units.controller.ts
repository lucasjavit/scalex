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

  // Helper method to get userId from request
  private getUserId(request: any): string {
    if (request?.user?.id) return request.user.id;
    const userId = request?.headers?.['x-user-id'];
    if (userId) return userId;
    throw new Error('UserId not found. User must be authenticated.');
  }

  @Public()
  @Get('stages/:stageId/units')
  findByStage(@Param('stageId') stageId: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.unitsService.findByStageWithProgress(stageId, userId);
  }

  @Public()
  @Get('units/:id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Public()
  @Post('units')
  create(@Body() createUnitDto: CreateUnitDto, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.unitsService.create(createUnitDto, userId);
  }

  @Public()
  @Patch('units/:id')
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @Req() request: any,
  ) {
    const userId = this.getUserId(request);
    return this.unitsService.update(id, updateUnitDto, userId);
  }

  @Public()
  @Delete('units/:id')
  remove(@Param('id') id: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.unitsService.remove(id, userId);
  }
}
