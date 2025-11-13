import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedPopularCompanies } from '../seeds/seed-popular-companies';

/**
 * Serviço responsável por inicializar o banco de dados
 * Roda seeds automaticamente quando o backend inicia
 */
@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    this.logger.log('🔧 Initializing database...');

    try {
      // Roda o seed de empresas populares
      await this.runPopularCompaniesSeed();
    } catch (error) {
      this.logger.error(`❌ Error during database initialization: ${error.message}`);
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
