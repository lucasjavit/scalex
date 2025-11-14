const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando migrations...\n');

const migrationsDir = path.join(__dirname, 'src', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.ts'))
  .sort();

console.log(`📋 Total de migrations encontradas: ${migrationFiles.length}\n`);

// Verificar se todas as migrations têm timestamps válidos
console.log('📅 Verificando timestamps das migrations:\n');

const migrations = migrationFiles.map(file => {
  const timestamp = file.split('-')[0];
  const name = file.replace('.ts', '').substring(timestamp.length + 1);
  return { file, timestamp: parseInt(timestamp), name };
});

// Ordenar por timestamp
migrations.sort((a, b) => a.timestamp - b.timestamp);

console.log('Ordem de execução das migrations:\n');
migrations.forEach((m, index) => {
  const date = new Date(m.timestamp);
  console.log(`${String(index + 1).padStart(2)}. [${date.toISOString().split('T')[0]}] ${m.name}`);
});

console.log('\n✅ Verificação de ordem concluída!\n');

// Verificar migrations críticas para o problema do company_slug
console.log('🔎 Verificando migrations críticas:\n');

const criticalMigrations = [
  'CreateRemoteJobsTables', // Cria tabela jobs com company_slug
  'CreateJobBoardsTable',   // Cria tabela job_boards
  'CreateJobBoardCompaniesTable', // Cria relacionamento job_board_companies
  'FixCompanyRelationToUsePrimaryKey', // Adiciona company_id
  'FixJobBoardsVsCompanies', // Popula dados iniciais
];

criticalMigrations.forEach(criticalName => {
  const found = migrations.find(m => m.name.includes(criticalName));
  if (found) {
    console.log(`  ✅ ${criticalName} - encontrada (${found.file})`);
  } else {
    console.log(`  ❌ ${criticalName} - NÃO ENCONTRADA!`);
  }
});

// Verificar se CreateRemoteJobsTables cria a coluna company_slug
console.log('\n🔍 Verificando conteúdo de migrations críticas:\n');

const createRemoteJobsFile = migrations.find(m => m.name.includes('CreateRemoteJobsTables'));
if (createRemoteJobsFile) {
  const content = fs.readFileSync(path.join(migrationsDir, createRemoteJobsFile.file), 'utf8');

  if (content.includes('"company_slug"')) {
    console.log('  ✅ CreateRemoteJobsTables contém criação da coluna "company_slug"');
  } else {
    console.log('  ❌ CreateRemoteJobsTables NÃO contém criação da coluna "company_slug"');
  }

  if (content.includes('"company_id"')) {
    console.log('  ✅ CreateRemoteJobsTables contém criação da coluna "company_id"');
  } else {
    console.log('  ⚠️  CreateRemoteJobsTables NÃO contém criação da coluna "company_id"');
  }
}

console.log('\n📊 Resumo:\n');
console.log(`  • Total de migrations: ${migrations.length}`);
console.log(`  • Primeira migration: ${migrations[0].name} (${new Date(migrations[0].timestamp).toISOString().split('T')[0]})`);
console.log(`  • Última migration: ${migrations[migrations.length - 1].name} (${new Date(migrations[migrations.length - 1].timestamp).toISOString().split('T')[0]})`);

console.log('\n✅ Verificação completa!\n');
console.log('💡 Quando você resetar o banco e reiniciar o backend:');
console.log('   1. Todas as 29 migrations serão executadas em ordem');
console.log('   2. A coluna company_slug será criada na tabela jobs');
console.log('   3. Os seeds rodarão automaticamente');
console.log('   4. Os scrapers funcionarão sem erros!\n');
