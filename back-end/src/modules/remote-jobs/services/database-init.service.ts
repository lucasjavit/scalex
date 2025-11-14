import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedAggregators } from '../seeds/seed-aggregators';
import { seedAshbyCompanies } from '../seeds/seed-ashby-companies';
import { seedATSPlatforms } from '../seeds/seed-ats-platforms';
import { seedBuiltInCompanies } from '../seeds/seed-builtin-companies';
import { seedPopularCompanies } from '../seeds/seed-popular-companies';
import { seedRemotiveCompanies } from '../seeds/seed-remotive-companies';
import { seedWeWorkRemotelyCompanies } from '../seeds/seed-weworkremotely-companies';

/**
 * Serviço responsável por inicializar o banco de dados
 * Roda seeds automaticamente quando o backend inicia
 *
 * Ordem de execução:
 * 1. ATS Platforms (lever, greenhouse, workable, ashby) - cria job_boards
 * 2. Aggregators (wellfound, builtin, weworkremotely, remotive, remoteyeah)
 * 3. Ashby Companies - popula empresas do Ashby (depende do job_board ashby)
 * 4. Built In Companies - popula empresas do Built In (depende do job_board builtin)
 * 5. We Work Remotely Companies - popula empresas do We Work Remotely (depende do job_board weworkremotely)
 * 6. Remotive Companies - popula empresas do Remotive (depende do job_board remotive)
 * 7. Popular Companies (93 empresas que usam as plataformas acima)
 */
@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    this.logger.log('🔧 Initializing database...');

    try {
      // 1. Criar job_boards para plataformas ATS (DEVE vir primeiro)
      await this.runATSPlatformsSeed();

      // 2. Criar job_boards para agregadores
      await this.runAggregatorsSeed();

      // 3. Popular empresas do Ashby (depende do job_board ashby criado acima)
      await this.runAshbyCompaniesSeed();

      // 4. Popular empresas do Built In (depende do job_board builtin criado acima)
      await this.runBuiltInCompaniesSeed();

      // 5. Popular empresas do We Work Remotely (depende do job_board weworkremotely criado acima)
      await this.runWeWorkRemotelyCompaniesSeed();

      // 6. Popular empresas do Remotive (depende do job_board remotive criado acima)
      await this.runRemotiveCompaniesSeed();

      // 7. Criar empresas populares (depende dos job_boards criados acima)
      await this.runPopularCompaniesSeed();

      this.logger.log('✅ Database initialization completed successfully');
    } catch (error) {
      this.logger.error(`❌ Error during database initialization: ${error.message}`);
    }
  }

  private async runATSPlatformsSeed() {
    try {
      this.logger.log('🌱 Running ATS platforms seed...');
      await seedATSPlatforms(this.dataSource);
      this.logger.log('✅ ATS platforms seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running ATS platforms seed: ${error.message}`);
    }
  }

  private async runAggregatorsSeed() {
    try {
      this.logger.log('🌱 Running aggregators seed...');
      await seedAggregators(this.dataSource);
      this.logger.log('✅ Aggregators seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running aggregators seed: ${error.message}`);
    }
  }

  private async runAshbyCompaniesSeed() {
    try {
      this.logger.log('🌱 Running Ashby companies seed...');
      await seedAshbyCompanies(this.dataSource);
      this.logger.log('✅ Ashby companies seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running Ashby companies seed: ${error.message}`);
    }
  }

  private async runBuiltInCompaniesSeed() {
    try {
      this.logger.log('🌱 Running Built In companies seed...');
      await seedBuiltInCompanies(this.dataSource);
      this.logger.log('✅ Built In companies seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running Built In companies seed: ${error.message}`);
    }
  }

  private async runWeWorkRemotelyCompaniesSeed() {
    try {
      this.logger.log('🌱 Running We Work Remotely companies seed...');
      await seedWeWorkRemotelyCompanies(this.dataSource);
      this.logger.log('✅ We Work Remotely companies seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running We Work Remotely companies seed: ${error.message}`);
    }
  }

  private async runRemotiveCompaniesSeed() {
    try {
      this.logger.log('🌱 Running Remotive companies seed...');
      await seedRemotiveCompanies(this.dataSource);
      this.logger.log('✅ Remotive companies seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running Remotive companies seed: ${error.message}`);
    }
  }

  private async runPopularCompaniesSeed() {
    try {
      this.logger.log('🌱 Running popular companies seed...');
      await seedPopularCompanies(this.dataSource);
      this.logger.log('✅ Popular companies seed completed');
    } catch (error) {
      this.logger.error(`❌ Error running popular companies seed: ${error.message}`);
    }
  }
}
