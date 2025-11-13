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

    const result = await client.query('SELECT slug, name, platform FROM companies ORDER BY name');

    console.log('📋 All companies in database:\n');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.slug}) - ${row.platform}`);
    });

    console.log(`\n📊 Total: ${result.rows.length} companies`);

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();
