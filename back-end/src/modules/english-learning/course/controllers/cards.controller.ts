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
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { CardsService } from '../services/cards.service';

@Controller('english-course')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
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
  create(
    @Body() createCardDto: CreateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cardsService.create(createCardDto, userId);
  }

  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.cardsService.update(id, updateCardDto, userId);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.cardsService.remove(id, userId);
  }
}
