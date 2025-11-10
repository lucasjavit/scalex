import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Greenhouse
 * Execute com: npm run seed:greenhouse
 */
export async function seedGreenhouseCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Greenhouse...');

  // 1. Criar/buscar o job board "greenhouse"
  let greenhouseBoard = await jobBoardRepo.findOne({
    where: { slug: 'greenhouse' },
  });

  if (!greenhouseBoard) {
    greenhouseBoard = await jobBoardRepo.save({
      slug: 'greenhouse',
      name: 'Greenhouse',
      url: 'https://boards.greenhouse.io',
      scraper: 'greenhouse',
      enabled: true,
      priority: 2,
      description: 'Plataforma de ATS usada por múltiplas empresas tech',
    });
    console.log('✅ Job board "greenhouse" criado');
  } else {
    console.log('ℹ️  Job board "greenhouse" já existe');
  }

  // 2. Lista de empresas do Greenhouse (apenas as VERIFICADAS)
  const companies = [
    // Top Tier - Big Tech & Unicorns
    { slug: 'airbnb', name: 'Airbnb', url: 'https://boards.greenhouse.io/airbnb/jobs' },
    { slug: 'duolingo', name: 'Duolingo', url: 'https://boards.greenhouse.io/duolingo/jobs' },
    { slug: 'hubspot', name: 'HubSpot', url: 'https://boards.greenhouse.io/hubspot/jobs' },
    { slug: 'pinterest', name: 'Pinterest', url: 'https://boards.greenhouse.io/pinterest/jobs' },
    { slug: 'snap', name: 'Snap Inc.', url: 'https://boards.greenhouse.io/snap/jobs' },
    { slug: 'doordash', name: 'DoorDash', url: 'https://boards.greenhouse.io/doordash/jobs' },
    { slug: 'coinbase', name: 'Coinbase', url: 'https://boards.greenhouse.io/coinbase/jobs' },
    { slug: 'robinhood', name: 'Robinhood', url: 'https://boards.greenhouse.io/robinhood/jobs' },
    { slug: 'canva', name: 'Canva', url: 'https://boards.greenhouse.io/canva/jobs' },

    // Remote-First Companies
    { slug: 'automattic', name: 'Automattic', url: 'https://boards.greenhouse.io/automattic/jobs' },
    { slug: 'gitlab', name: 'GitLab', url: 'https://boards.greenhouse.io/gitlab/jobs' },
    { slug: 'zapier', name: 'Zapier', url: 'https://boards.greenhouse.io/zapier/jobs' },
    { slug: 'buffer', name: 'Buffer', url: 'https://boards.greenhouse.io/buffer/jobs' },

    // SaaS & B2B
    { slug: 'asana', name: 'Asana', url: 'https://boards.greenhouse.io/asana/jobs' },
    { slug: 'notion', name: 'Notion', url: 'https://boards.greenhouse.io/notion/jobs' },
    { slug: 'airtable', name: 'Airtable', url: 'https://boards.greenhouse.io/airtable/jobs' },
    { slug: 'miro', name: 'Miro', url: 'https://boards.greenhouse.io/miro/jobs' },
    { slug: 'figma', name: 'Figma', url: 'https://boards.greenhouse.io/figma/jobs' },
    { slug: 'datadog', name: 'Datadog', url: 'https://boards.greenhouse.io/datadog/jobs' },
    { slug: 'twilio', name: 'Twilio', url: 'https://boards.greenhouse.io/twilio/jobs' },

    // FinTech
    { slug: 'plaid', name: 'Plaid', url: 'https://boards.greenhouse.io/plaid/jobs' },
    { slug: 'chime', name: 'Chime', url: 'https://boards.greenhouse.io/chime/jobs' },
    { slug: 'brex', name: 'Brex', url: 'https://boards.greenhouse.io/brex/jobs' },
    { slug: 'affirm', name: 'Affirm', url: 'https://boards.greenhouse.io/affirm/jobs' },

    // E-commerce & Marketplaces
    { slug: 'shopify', name: 'Shopify', url: 'https://boards.greenhouse.io/shopify/jobs' },
    { slug: 'instacart', name: 'Instacart', url: 'https://boards.greenhouse.io/instacart/jobs' },
    { slug: 'grubhub', name: 'Grubhub', url: 'https://boards.greenhouse.io/grubhub/jobs' },

    // Healthcare & BioTech
    { slug: 'oscar', name: 'Oscar Health', url: 'https://boards.greenhouse.io/oscar/jobs' },
    { slug: 'hims', name: 'Hims & Hers', url: 'https://boards.greenhouse.io/hims/jobs' },
    { slug: 'ro', name: 'Ro', url: 'https://boards.greenhouse.io/ro/jobs' },

    // AI & Data
    { slug: 'scale', name: 'Scale AI', url: 'https://boards.greenhouse.io/scale/jobs' },
    { slug: 'databricks', name: 'Databricks', url: 'https://boards.greenhouse.io/databricks/jobs' },
    { slug: 'snowflake', name: 'Snowflake', url: 'https://boards.greenhouse.io/snowflake/jobs' },

    // Growth Companies - Y Combinator Alumni
    { slug: 'rippling', name: 'Rippling', url: 'https://boards.greenhouse.io/rippling/jobs' },
    { slug: 'gusto', name: 'Gusto', url: 'https://boards.greenhouse.io/gusto/jobs' },
    { slug: 'lattice', name: 'Lattice', url: 'https://boards.greenhouse.io/lattice/jobs' },
    { slug: 'gong', name: 'Gong', url: 'https://boards.greenhouse.io/gong/jobs' },
    { slug: 'outreach', name: 'Outreach', url: 'https://boards.greenhouse.io/outreach/jobs' },

    // DevTools & Infrastructure
    { slug: 'vercel', name: 'Vercel', url: 'https://boards.greenhouse.io/vercel/jobs' },
    { slug: 'render', name: 'Render', url: 'https://boards.greenhouse.io/render/jobs' },
    { slug: 'fly', name: 'Fly.io', url: 'https://boards.greenhouse.io/fly/jobs' },
    { slug: 'planetscale', name: 'PlanetScale', url: 'https://boards.greenhouse.io/planetscale/jobs' },
    { slug: 'neon', name: 'Neon', url: 'https://boards.greenhouse.io/neon/jobs' },

    // Security & Infrastructure
    { slug: 'snyk', name: 'Snyk', url: 'https://boards.greenhouse.io/snyk/jobs' },
    { slug: '1password', name: '1Password', url: 'https://boards.greenhouse.io/1password/jobs' },
    { slug: 'tailscale', name: 'Tailscale', url: 'https://boards.greenhouse.io/tailscale/jobs' },

    // Modern SaaS
    { slug: 'linear', name: 'Linear', url: 'https://boards.greenhouse.io/linear/jobs' },
    { slug: 'cal', name: 'Cal.com', url: 'https://boards.greenhouse.io/cal/jobs' },
    { slug: 'resend', name: 'Resend', url: 'https://boards.greenhouse.io/resend/jobs' },
    { slug: 'clerk', name: 'Clerk', url: 'https://boards.greenhouse.io/clerk/jobs' },

    // Consumer Apps
    { slug: 'calm', name: 'Calm', url: 'https://boards.greenhouse.io/calm/jobs' },
    { slug: 'headspace', name: 'Headspace', url: 'https://boards.greenhouse.io/headspace/jobs' },

    // Latin America
    { slug: 'nubank', name: 'Nubank', url: 'https://boards.greenhouse.io/nubank/jobs' },
    { slug: 'rappi', name: 'Rappi', url: 'https://boards.greenhouse.io/rappi/jobs' },
    { slug: 'kavak', name: 'Kavak', url: 'https://boards.greenhouse.io/kavak/jobs' },
    { slug: 'clip', name: 'Clip', url: 'https://boards.greenhouse.io/clip/jobs' },
  ];

  let createdCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com greenhouse
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'greenhouse',
        featured: false,
        featuredOrder: 0,
        rating: 0,
        reviewCount: 0,
        totalJobs: 0,
      });
      createdCompanies++;
      console.log(`  ✅ Empresa criada: ${companyData.name}`);
    }

    // 3.2. Criar a relação job_board_companies
    const existingRelation = await jbcRepo.findOne({
      where: {
        jobBoardId: greenhouseBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: greenhouseBoard.id,
        companyId: company.id,
        scraperUrl: companyData.url,
        enabled: true,
        scrapingStatus: null,
        lastScrapedAt: null,
        errorMessage: null,
      });
      createdRelations++;
      console.log(`  🔗 Relação criada para: ${companyData.name}`);
    } else {
      skippedRelations++;
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Empresas criadas: ${createdCompanies}`);
  console.log(`  • Relações criadas: ${createdRelations}`);
  console.log(`  • Relações já existentes: ${skippedRelations}`);
  console.log('\n✅ Seed Greenhouse concluído!');
}
