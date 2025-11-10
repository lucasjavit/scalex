import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entities
import { Company } from './entities/company.entity';
import { Job } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { JobBoard } from './entities/job-board.entity';
import { JobBoardCompany } from './entities/job-board-company.entity';

// Services
import { CompanyService } from './services/company.service';
import { JobService } from './services/job.service';
import { JobBoardAggregatorService } from './services/job-board-aggregator.service';
import { SavedJobService } from './services/saved-job.service';
import { JobBoardCompanyService } from './services/job-board-company.service';

// Scrapers
import { GenericScraperService } from './scrapers/generic-scraper.service';
import { GreenhouseScraperService } from './scrapers/greenhouse-scraper.service';
import { LeverScraperService } from './scrapers/lever-scraper.service';
import { WorkableScraperService } from './scrapers/workable-scraper.service';
import { AshbyScraperService } from './scrapers/ashby-scraper.service';
import { WellfoundScraperService } from './scrapers/wellfound-scraper.service';
import { BuiltInScraperService } from './scrapers/builtin-scraper.service';
import { WeWorkRemotelyScraperService } from './scrapers/weworkremotely-scraper.service';
import { RemotiveScraperService } from './scrapers/remotive-scraper.service';
import { RemoteYeahScraperService } from './scrapers/remoteyeah-scraper.service';

// Controllers
import { CompanyController } from './controllers/company.controller';
import { JobController } from './controllers/job.controller';
import { JobBoardController } from './controllers/job-board.controller';
import { SavedJobController } from './controllers/saved-job.controller';
import { JobBoardCompanyController } from './controllers/job-board-company.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Job,
      SavedJob,
      JobBoard,
      JobBoardCompany,
    ]),
    HttpModule,
  ],
  controllers: [
    CompanyController,
    JobController,
    JobBoardController,
    SavedJobController,
    JobBoardCompanyController,
  ],
  providers: [
    // Services
    CompanyService,
    JobService,
    JobBoardAggregatorService,
    SavedJobService,
    JobBoardCompanyService,
    // Scrapers
    GenericScraperService,
    GreenhouseScraperService,
    LeverScraperService,
    WorkableScraperService,
    AshbyScraperService,
    WellfoundScraperService,
    BuiltInScraperService,
    WeWorkRemotelyScraperService,
    RemotiveScraperService,
    RemoteYeahScraperService,
  ],
  exports: [CompanyService, JobService, JobBoardAggregatorService],
})
export class RemoteJobsModule {}
// trigger recompile
