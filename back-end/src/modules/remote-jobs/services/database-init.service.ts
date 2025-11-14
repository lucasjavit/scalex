import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedAggregators } from '../seeds/seed-aggregators';
import { seedAshbyCompanies } from '../seeds/seed-ashby-companies';
import { seedATSPlatforms } from '../seeds/seed-ats-platforms';
import { seedPopularCompanies } from '../seeds/seed-popular-companies';

/**
 * Serviço responsável por inicializar o banco de dados
 * Roda seeds automaticamente quando o backend inicia
 *
 * Ordem de execução:
 * 1. ATS Platforms (lever, greenhouse, workable, ashby) - cria job_boards
 * 2. Aggregators (wellfound, builtin, weworkremotely, remotive, remoteyeah)
 * 3. Ashby Companies - popula empresas do Ashby (depende do job_board ashby)
 * 4. Popular Companies (93 empresas que usam as plataformas acima)
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

      // 4. Criar empresas populares (depende dos job_boards criados acima)
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
