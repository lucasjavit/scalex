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
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';
import { StagesService } from '../services/stages.service';

@Controller('api/english-course/stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  // Helper method to get userId from request
  private getUserId(request: any): string {
    if (request?.user?.id) return request.user.id;
    const userId = request?.headers?.['x-user-id'];
    if (userId) return userId;
    throw new Error('UserId not found. User must be authenticated.');
  }

  @Public()
  @Get()
  findAll(@Req() request: any) {
    const userId = this.getUserId(request);
    return this.stagesService.findAllWithProgress(userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stagesService.findOne(id);
  }

  @Public()
  @Post()
  create(@Body() createStageDto: CreateStageDto, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.stagesService.create(createStageDto, userId);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
    @Req() request: any,
  ) {
    const userId = this.getUserId(request);
    return this.stagesService.update(id, updateStageDto, userId);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.stagesService.remove(id, userId);
  }
}
