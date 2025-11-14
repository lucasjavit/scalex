import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { seedAshbyCompanies } from './seed-ashby-companies';

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

    // Executa o seed do Ashby com descoberta de empresas
    console.log('🔍 Modo descoberta ativado - testando empresas na API do Ashby...\n');
    await seedAshbyCompanies(dataSource, { discoverCompanies: true });

    console.log('\n🎉 Processo finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();

