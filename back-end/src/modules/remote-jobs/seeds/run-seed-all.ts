import { DataSource } from 'typeorm';
import { seedWorkableCompanies } from './seed-workable-companies';
import { seedLeverCompanies } from './seed-lever-companies';
import { seedGreenhouseCompanies } from './seed-greenhouse-companies';
import { seedAshbyCompanies } from './seed-ashby-companies';
import { seedBuiltInCompanies } from './seed-builtin-companies';
import { seedAggregators } from './seed-aggregators';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function runAllSeeds() {
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
    console.log('🌍 Executando TODOS os seeds...\n');
    console.log('='.repeat(60));

    // Executa todos os seeds em sequência
    console.log('\n📍 [1/6] Workable');
    console.log('='.repeat(60));
    await seedWorkableCompanies(dataSource);

    console.log('\n📍 [2/6] Lever');
    console.log('='.repeat(60));
    await seedLeverCompanies(dataSource);

    console.log('\n📍 [3/6] Greenhouse');
    console.log('='.repeat(60));
    await seedGreenhouseCompanies(dataSource);

    console.log('\n📍 [4/6] Ashby');
    console.log('='.repeat(60));
    await seedAshbyCompanies(dataSource);

    console.log('\n📍 [5/6] Built In');
    console.log('='.repeat(60));
    await seedBuiltInCompanies(dataSource);

    console.log('\n📍 [6/6] Agregadores (Wellfound, We Work Remotely, Remotive, etc)');
    console.log('='.repeat(60));
    await seedAggregators(dataSource);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TODOS OS SEEDS CONCLUÍDOS COM SUCESSO!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Erro ao executar seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runAllSeeds();
