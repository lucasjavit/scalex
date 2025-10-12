import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { Language } from './entities/language.entity';
import { CountriesService } from './services/countries.service';
import { StatesService } from './services/states.service';
import { LanguagesService } from './services/languages.service';
import { CountriesController } from './controllers/countries.controller';
import { StatesController } from './controllers/states.controller';
import { LanguagesController } from './controllers/languages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country, State, Language])],
  controllers: [CountriesController, StatesController, LanguagesController],
  providers: [CountriesService, StatesService, LanguagesService],
  exports: [CountriesService, StatesService, LanguagesService],
})
export class CommonModule {}
