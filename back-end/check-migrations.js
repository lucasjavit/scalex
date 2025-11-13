const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'scalex',
});

(async () => {
  try {
    await client.connect();

    console.log('📋 Checking migrations status...\n');

    const result = await client.query('SELECT name, timestamp FROM migrations ORDER BY timestamp DESC LIMIT 15');

    console.log('Last 15 migrations executed:');
    result.rows.forEach((row, index) => {
      const date = new Date(parseInt(row.timestamp));
      console.log(`${index + 1}. ${row.name} (${date.toISOString()})`);
    });

    console.log('\n📊 Checking jobs table schema...\n');

    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'jobs'
      ORDER BY ordinal_position
    `);

    console.log('Jobs table columns:');
    columnsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();
