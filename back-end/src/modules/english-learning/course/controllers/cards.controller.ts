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
import { CardsService } from '../services/cards.service';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';

@Controller('api/english-course')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('units/:unitId/cards')
  findByUnit(@Param('unitId') unitId: string) {
    return this.cardsService.findByUnit(unitId);
  }

  @Get('cards/:id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Post('cards')
  @Roles('admin')
  create(@Body() createCardDto: CreateCardDto, @CurrentUser() user: any) {
    return this.cardsService.create(createCardDto, user.id);
  }

  @Patch('cards/:id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() user: any,
  ) {
    return this.cardsService.update(id, updateCardDto, user.id);
  }

  @Delete('cards/:id')
  @Roles('admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cardsService.remove(id, user.id);
  }
}
