const { Client } = require('pg');

async function resetDatabase() {
  // Connect to postgres database (not scalex)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // Connect to postgres db to drop/create scalex
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL');

    // Terminate all connections to scalex database
    console.log('\n🔪 Terminating all connections to scalex database...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'scalex'
        AND pid <> pg_backend_pid()
    `);

    // Drop database
    console.log('🗑️  Dropping database scalex...');
    await client.query('DROP DATABASE IF EXISTS scalex');

    // Create database
    console.log('🆕 Creating database scalex...');
    await client.query('CREATE DATABASE scalex');

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 Next steps:');
    console.log('  1. Restart the backend (npm run start:dev)');
    console.log('  2. Migrations will run automatically');
    console.log('  3. Seeds will run automatically');
    console.log('  4. Everything will be fresh and clean! 🎉');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

resetDatabase();
