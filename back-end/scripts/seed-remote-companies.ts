import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Company } from '../src/modules/remote-jobs/entities/company.entity';
import { JobBoard } from '../src/modules/remote-jobs/entities/job-board.entity';
import { JobBoardCompany } from '../src/modules/remote-jobs/entities/job-board-company.entity';

dotenv.config();

// Lista curada de empresas remotas conhecidas e suas plataformas
const REMOTE_COMPANIES = [
  // Greenhouse Companies
  { name: 'GitLab', slug: 'gitlab', platform: 'greenhouse', careersUrl: 'https://boards.greenhouse.io/gitlab', featured: true },
  { name: 'Spotify', slug: 'spotify', platform: 'greenhouse', careersUrl: 'https://jobs.lever.co/spotify', featured: true },
  { name: 'Shopify', slug: 'shopify', platform: 'greenhouse', careersUrl: 'https://www.shopify.com/careers', featured: true },
  { name: 'Stripe', slug: 'stripe', platform: 'greenhouse', careersUrl: 'https://stripe.com/jobs', featured: true },
  { name: 'Automattic', slug: 'automattic', platform: 'greenhouse', careersUrl: 'https://automattic.com/work-with-us/', featured: true },
  { name: 'Zapier', slug: 'zapier', platform: 'greenhouse', careersUrl: 'https://zapier.com/jobs', featured: true },
  { name: 'DuckDuckGo', slug: 'duckduckgo', platform: 'greenhouse', careersUrl: 'https://duckduckgo.com/hiring', featured: false },
  { name: 'Basecamp', slug: 'basecamp', platform: 'greenhouse', careersUrl: 'https://basecamp.com/about/jobs', featured: false },
  { name: 'GitHub', slug: 'github', platform: 'greenhouse', careersUrl: 'https://www.github.careers/', featured: true },
  { name: 'Sourcegraph', slug: 'sourcegraph', platform: 'greenhouse', careersUrl: 'https://boards.greenhouse.io/sourcegraph91', featured: false },
  { name: 'HashiCorp', slug: 'hashicorp', platform: 'greenhouse', careersUrl: 'https://www.hashicorp.com/jobs', featured: true },
  { name: 'Elastic', slug: 'elastic', platform: 'greenhouse', careersUrl: 'https://www.elastic.co/careers', featured: true },
  { name: 'Canonical', slug: 'canonical', platform: 'greenhouse', careersUrl: 'https://canonical.com/careers', featured: false },
  { name: 'Datadog', slug: 'datadog', platform: 'greenhouse', careersUrl: 'https://www.datadoghq.com/careers/', featured: true },
  { name: 'Grafana Labs', slug: 'grafana', platform: 'greenhouse', careersUrl: 'https://grafana.com/about/careers/', featured: false },
  { name: 'Confluent', slug: 'confluent', platform: 'greenhouse', careersUrl: 'https://www.confluent.io/careers/', featured: false },
  { name: 'PostHog', slug: 'posthog', platform: 'greenhouse', careersUrl: 'https://posthog.com/careers', featured: false },

  // Lever Companies
  { name: 'Notion', slug: 'notion', platform: 'lever', careersUrl: 'https://www.notion.so/careers', featured: true },
  { name: 'Figma', slug: 'figma', platform: 'lever', careersUrl: 'https://www.figma.com/careers/', featured: true },
  { name: 'Linear', slug: 'linear', platform: 'lever', careersUrl: 'https://linear.app/careers', featured: false },
  { name: 'Vercel', slug: 'vercel', platform: 'lever', careersUrl: 'https://vercel.com/careers', featured: true },
  { name: 'Netlify', slug: 'netlify', platform: 'lever', careersUrl: 'https://www.netlify.com/careers/', featured: false },
  { name: 'Webflow', slug: 'webflow', platform: 'lever', careersUrl: 'https://webflow.com/careers', featured: false },
  { name: 'Plaid', slug: 'plaid', platform: 'lever', careersUrl: 'https://plaid.com/careers/', featured: false },
  { name: 'Airtable', slug: 'airtable', platform: 'lever', careersUrl: 'https://airtable.com/careers', featured: false },

  // Workable Companies
  { name: 'Buffer', slug: 'buffer', platform: 'workable', careersUrl: 'https://buffer.com/journey', featured: false },
  { name: 'Ghost', slug: 'ghost', platform: 'workable', careersUrl: 'https://ghost.org/careers/', featured: false },
  { name: 'Toggl', slug: 'toggl', platform: 'workable', careersUrl: 'https://toggl.com/jobs/', featured: false },

  // Ashby Companies
  { name: 'Deel', slug: 'deel', platform: 'ashby', careersUrl: 'https://www.deel.com/careers', featured: true },
  { name: 'Remote', slug: 'remote', platform: 'ashby', careersUrl: 'https://remote.com/careers', featured: true },
  { name: 'Supabase', slug: 'supabase', platform: 'ashby', careersUrl: 'https://supabase.com/careers', featured: true },
  { name: 'Railway', slug: 'railway', platform: 'ashby', careersUrl: 'https://railway.app/careers', featured: false },

  // Custom/Other Platforms
  { name: 'Toptal', slug: 'toptal', platform: 'greenhouse', careersUrl: 'https://www.toptal.com/careers', featured: true },
  { name: 'Turing', slug: 'turing', platform: 'greenhouse', careersUrl: 'https://www.turing.com/jobs', featured: false },
  { name: 'GitLab', slug: 'gitlab', platform: 'greenhouse', careersUrl: 'https://about.gitlab.com/jobs/', featured: true },
  { name: 'InVision', slug: 'invision', platform: 'lever', careersUrl: 'https://www.invisionapp.com/careers', featured: false },
  { name: 'Help Scout', slug: 'helpscout', platform: 'greenhouse', careersUrl: 'https://www.helpscout.com/company/careers/', featured: false },
  { name: 'Close', slug: 'close', platform: 'lever', careersUrl: 'https://jobs.close.com/', featured: false },
  { name: 'Doist', slug: 'doist', platform: 'greenhouse', careersUrl: 'https://doist.com/careers', featured: false },
  { name: 'ConvertKit', slug: 'convertkit', platform: 'greenhouse', careersUrl: 'https://convertkit.com/careers', featured: false },
  { name: 'Auth0', slug: 'auth0', platform: 'greenhouse', careersUrl: 'https://auth0.com/careers', featured: false },
  { name: 'Hopin', slug: 'hopin', platform: 'greenhouse', careersUrl: 'https://hopin.com/careers', featured: false },
  { name: 'Checkly', slug: 'checkly', platform: 'ashby', careersUrl: 'https://www.checklyhq.com/jobs/', featured: false },
  { name: 'Fly.io', slug: 'fly-io', platform: 'ashby', careersUrl: 'https://fly.io/jobs/', featured: false },

  // More Greenhouse
  { name: 'Discourse', slug: 'discourse', platform: 'greenhouse', careersUrl: 'https://www.discourse.org/team', featured: false },
  { name: 'Mattermost', slug: 'mattermost', platform: 'lever', careersUrl: 'https://mattermost.com/careers/', featured: false },
  { name: 'Time Doctor', slug: 'time-doctor', platform: 'greenhouse', careersUrl: 'https://www.timedoctor.com/careers.html', featured: false },
  { name: 'Hotjar', slug: 'hotjar', platform: 'lever', careersUrl: 'https://careers.hotjar.com/', featured: false },
  { name: 'Loom', slug: 'loom', platform: 'lever', careersUrl: 'https://www.loom.com/careers', featured: true },
  { name: 'Cal.com', slug: 'cal-com', platform: 'ashby', careersUrl: 'https://cal.com/careers', featured: false },
];

async function seedCompanies() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const companyRepo = dataSource.getRepository(Company);
    const jobBoardRepo = dataSource.getRepository(JobBoard);
    const jobBoardCompanyRepo = dataSource.getRepository(JobBoardCompany);

    // Get all job boards
    const jobBoards = await jobBoardRepo.find();
    const jobBoardMap = new Map(jobBoards.map(jb => [jb.slug, jb]));

    console.log(`📋 Found ${jobBoards.length} job boards`);

    let created = 0;
    let skipped = 0;
    let linked = 0;

    for (const companyData of REMOTE_COMPANIES) {
      // Check if company already exists
      const existing = await companyRepo.findOne({
        where: { slug: companyData.slug },
      });

      let company;
      if (existing) {
        console.log(`⏭️  Skipping ${companyData.name} (already exists)`);
        company = existing;
        skipped++;
      } else {
        // Create company
        company = await companyRepo.save({
          name: companyData.name,
          slug: companyData.slug,
          platform: companyData.platform as 'lever' | 'greenhouse' | 'ashby' | 'workable',
          featured: companyData.featured,
        });
        console.log(`✅ Created ${companyData.name}`);
        created++;
      }

      // Link to job board if exists
      const jobBoard = jobBoardMap.get(companyData.platform);
      if (jobBoard) {
        const existingLink = await jobBoardCompanyRepo.findOne({
          where: {
            jobBoardId: jobBoard.id,
            companyId: company.id,
          },
        });

        if (!existingLink) {
          // Generate scraper URL based on platform
          let scraperUrl = companyData.careersUrl;
          if (!scraperUrl) {
            // Generate default URL based on platform and slug
            switch (companyData.platform) {
              case 'greenhouse':
                scraperUrl = `https://boards.greenhouse.io/${companyData.slug}`;
                break;
              case 'lever':
                scraperUrl = `https://jobs.lever.co/${companyData.slug}`;
                break;
              case 'workable':
                scraperUrl = `https://apply.workable.com/${companyData.slug}/`;
                break;
              case 'ashby':
                scraperUrl = `https://jobs.ashbyhq.com/${companyData.slug}`;
                break;
            }
          }

          await jobBoardCompanyRepo.save({
            jobBoardId: jobBoard.id,
            companyId: company.id,
            scraperUrl: scraperUrl,
            enabled: true,
          });
          console.log(`  🔗 Linked to ${jobBoard.name} (${scraperUrl})`);
          linked++;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Created: ${created} companies`);
    console.log(`  Skipped: ${skipped} companies (already exist)`);
    console.log(`  Linked: ${linked} job board connections`);

    await dataSource.destroy();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedCompanies();
