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
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { CardsService } from '../services/cards.service';

@Controller('api/english-course')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Helper method to get userId from request
  private getUserId(request: any): string {
    if (request?.user?.id) return request.user.id;
    const userId = request?.headers?.['x-user-id'];
    if (userId) return userId;
    throw new Error('UserId not found. User must be authenticated.');
  }

  @Public()
  @Get('units/:unitId/cards')
  findByUnit(@Param('unitId') unitId: string) {
    return this.cardsService.findByUnit(unitId);
  }

  @Get('cards/:id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Public()
  @Post('cards')
  create(@Body() createCardDto: CreateCardDto, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.cardsService.create(createCardDto, userId);
  }

  @Public()
  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @Req() request: any,
  ) {
    const userId = this.getUserId(request);
    return this.cardsService.update(id, updateCardDto, userId);
  }

  @Public()
  @Delete('cards/:id')
  remove(@Param('id') id: string, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.cardsService.remove(id, userId);
  }
}
