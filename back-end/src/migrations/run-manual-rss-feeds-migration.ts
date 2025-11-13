import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function runManualMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'scalex',
    synchronize: false,
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await dataSource.initialize();
    console.log('✅ Conectado!\n');

    console.log('🔧 Criando tabela rss_feeds...');

    // Create rss_feeds table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_board_id UUID NOT NULL,
        url VARCHAR(500) NOT NULL,
        category VARCHAR(200) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        last_scraped_at TIMESTAMP,
        scraping_status VARCHAR(20) CHECK (scraping_status IN ('pending', 'success', 'error')),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_board_id) REFERENCES job_boards(id) ON DELETE CASCADE
      );
    `);
    console.log('  ✅ Tabela rss_feeds criada');

    // Create indexes
    console.log('  • Criando índices...');
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_rss_feeds_job_board_id ON rss_feeds(job_board_id);
    `);
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_rss_feeds_enabled ON rss_feeds(enabled);
    `);
    console.log('  ✅ Índices criados');

    console.log('\n✅ Migração manual concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migração manual:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runManualMigration();
