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

    console.log('🔧 Adicionando suporte ao Built In no banco de dados...');

    // 1. Add 'builtin' to the platform enum
    console.log('  • Adicionando "builtin" ao enum companies_platform_enum...');
    await dataSource.query(`
      ALTER TYPE companies_platform_enum ADD VALUE IF NOT EXISTS 'builtin';
    `);
    console.log('    ✅ Enum atualizado');

    // 2. Add metadata column
    console.log('  • Adicionando coluna metadata à tabela companies...');
    await dataSource.query(`
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
    `);
    console.log('    ✅ Coluna metadata adicionada');

    console.log('\n✅ Migração manual concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migração manual:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runManualMigration();
