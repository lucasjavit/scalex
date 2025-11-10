import { DataSource } from 'typeorm';
import { seedGreenhouseCompanies } from './seed-greenhouse-companies';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function runSeed() {
  // Cria conexão com o banco
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

    // Executa o seed do Greenhouse
    await seedGreenhouseCompanies(dataSource);

    console.log('\n🎉 Processo finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
