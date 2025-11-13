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

    const result = await client.query('SELECT slug, name, scraper, priority, enabled FROM job_boards ORDER BY priority, slug');

    console.log('📋 All Job Boards in database:\n');
    result.rows.forEach((row, index) => {
      const status = row.enabled ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${row.name} (${row.slug}) - scraper: ${row.scraper} - priority: ${row.priority}`);
    });

    console.log(`\n📊 Total: ${result.rows.length} job boards`);

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();
