import { DataSource } from 'typeorm';
import { seedPopularCompanies } from './seed-popular-companies';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'scalex',
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await dataSource.initialize();
    console.log('✅ Conectado!\n');

    await seedPopularCompanies(dataSource);

    console.log('\n🎉 Processo concluído!');
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

run();
