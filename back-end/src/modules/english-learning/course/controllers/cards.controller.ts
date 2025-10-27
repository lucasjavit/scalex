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
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { CardsService } from '../services/cards.service';

@Controller('api/english-course')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

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
  create(@Body() createCardDto: CreateCardDto) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.cardsService.create(createCardDto, userId);
  }

  @Public()
  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.cardsService.update(id, updateCardDto, userId);
  }

  @Public()
  @Delete('cards/:id')
  remove(@Param('id') id: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.cardsService.remove(id, userId);
  }
}
