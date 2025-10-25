const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'scalex'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // 1. Drop all tables
    console.log('\n🗑️  Dropando todas as tabelas...');
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('✅ Todas as tabelas foram removidas');

    // 2. Recreate schema
    console.log('\n📋 Recriando schema do banco de dados...');
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);
    console.log('✅ Schema recriado com sucesso');

    // 3. Add sample data
    console.log('\n📝 Adicionando dados de exemplo...');
    const sampleDataSQL = fs.readFileSync(path.join(__dirname, 'english-course-cards-data.sql'), 'utf8');
    await client.query(sampleDataSQL);
    console.log('✅ Dados de exemplo adicionados');

    // 4. Verify
    console.log('\n🔍 Verificando dados...');
    const lessonsResult = await client.query('SELECT COUNT(*) FROM english_lessons;');
    const questionsResult = await client.query('SELECT COUNT(*) FROM english_questions;');

    console.log(`✅ Lições criadas: ${lessonsResult.rows[0].count}`);
    console.log(`✅ Perguntas criadas: ${questionsResult.rows[0].count}`);

    console.log('\n🎉 Banco de dados resetado com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

resetDatabase().catch(console.error);
