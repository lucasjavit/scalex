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

    console.log('📊 Checking database state...\n');

    // Check cron config
    const cronResult = await client.query("SELECT * FROM cron_config WHERE key = 'job_scraping_cron'");
    console.log('⏰ Cron Configuration:');
    if (cronResult.rows.length > 0) {
      console.log('  Expression:', cronResult.rows[0].value);
      console.log('  Description:', cronResult.rows[0].description);
    } else {
      console.log('  ⚠️  No cron config found');
    }

    console.log('\n📈 Current Database Stats:');

    // Count companies
    const companiesResult = await client.query('SELECT COUNT(*) FROM companies');
    console.log('  Companies:', companiesResult.rows[0].count);

    // Count job boards
    const jobBoardsResult = await client.query('SELECT COUNT(*) FROM job_boards');
    console.log('  Job Boards:', jobBoardsResult.rows[0].count);

    // Count job board companies (enabled)
    const jbcResult = await client.query('SELECT COUNT(*) FROM job_board_companies WHERE enabled = true');
    console.log('  Enabled Scraper Configs:', jbcResult.rows[0].count);

    // Count jobs
    const jobsResult = await client.query('SELECT COUNT(*) FROM jobs');
    console.log('  Total Jobs:', jobsResult.rows[0].count);

    const activeJobsResult = await client.query('SELECT COUNT(*) FROM jobs WHERE is_active = true');
    console.log('  Active Jobs:', activeJobsResult.rows[0].count);

    console.log('\n💡 Scraping Status:');
    if (jbcResult.rows[0].count > 0) {
      console.log('  ✅', jbcResult.rows[0].count, 'companies configured for scraping');
      if (jobsResult.rows[0].count === '0') {
        console.log('  ⏳ Waiting for cron job to run (schedule:', cronResult.rows[0]?.value || 'unknown', ')');
        console.log('  📝 The scraper will automatically run on schedule');
        console.log('');
        console.log('  💡 To trigger manually, use the admin endpoint:');
        console.log('     POST http://localhost:3000/api/admin/remote-jobs/scraping/trigger');
        console.log('     (Requires Firebase Admin authentication)');
      }
    } else {
      console.log('  ⚠️  No companies configured for scraping');
      console.log('  💡 Run seed:popular to populate companies');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
})();
