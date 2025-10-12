import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatesService } from '../services/states.service';

@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  findAll(@Query('countryId') countryId?: string) {
    if (countryId) {
      return this.statesService.findByCountry(countryId);
    }
    return this.statesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statesService.findOne(id);
  }
}
