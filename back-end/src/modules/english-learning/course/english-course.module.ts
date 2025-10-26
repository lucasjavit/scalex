import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Stage } from './entities/stage.entity';
import { Unit } from './entities/unit.entity';
import { Card } from './entities/card.entity';
import { UserStageProgress } from './entities/user-stage-progress.entity';
import { UserUnitProgress } from './entities/user-unit-progress.entity';
import { UserCardProgress } from './entities/user-card-progress.entity';
import { ReviewSession } from './entities/review-session.entity';

// Services
import { StagesService } from './services/stages.service';
import { UnitsService } from './services/units.service';
import { CardsService } from './services/cards.service';
import { ProgressService } from './services/progress.service';
import { ReviewService } from './services/review.service';
import { Sm2Service } from './services/sm2.service';

// Controllers
import { StagesController } from './controllers/stages.controller';
import { UnitsController } from './controllers/units.controller';
import { CardsController } from './controllers/cards.controller';
import { ProgressController } from './controllers/progress.controller';
import { ReviewController } from './controllers/review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Stage,
      Unit,
      Card,
      UserStageProgress,
      UserUnitProgress,
      UserCardProgress,
      ReviewSession,
    ]),
  ],
  controllers: [
    StagesController,
    UnitsController,
    CardsController,
    ProgressController,
    ReviewController,
  ],
  providers: [
    StagesService,
    UnitsService,
    CardsService,
    ProgressService,
    ReviewService,
    Sm2Service,
  ],
  exports: [
    StagesService,
    UnitsService,
    CardsService,
    ProgressService,
    ReviewService,
    Sm2Service,
  ],
})
export class EnglishCourseModule {}
