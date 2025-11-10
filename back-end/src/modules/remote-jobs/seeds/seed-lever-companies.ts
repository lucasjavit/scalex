import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Lever
 * Execute com: npm run seed:lever
 */
export async function seedLeverCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Lever...');

  // 1. Criar/buscar o job board "lever"
  let leverBoard = await jobBoardRepo.findOne({
    where: { slug: 'lever' },
  });

  if (!leverBoard) {
    leverBoard = await jobBoardRepo.save({
      slug: 'lever',
      name: 'Lever',
      url: 'https://jobs.lever.co',
      scraper: 'lever',
      enabled: true,
      priority: 2,
      description: 'Plataforma de ATS usada por múltiplas empresas tech',
    });
    console.log('✅ Job board "lever" criado');
  } else {
    console.log('ℹ️  Job board "lever" já existe');
  }

  // 2. Lista de empresas do Lever (baseado em lever-companies.ts)
  const companies = [
    // Tech Giants
    { slug: 'netflix', name: 'Netflix', url: 'https://jobs.lever.co/netflix' },
    { slug: 'uber', name: 'Uber', url: 'https://jobs.lever.co/uber' },
    { slug: 'lever', name: 'Lever', url: 'https://jobs.lever.co/lever' },

    // Crypto/Web3
    { slug: 'coinbase', name: 'Coinbase', url: 'https://jobs.lever.co/coinbase' },
    { slug: 'binance', name: 'Binance', url: 'https://jobs.lever.co/binance' },
    { slug: 'kraken', name: 'Kraken', url: 'https://jobs.lever.co/kraken' },
    { slug: 'gemini', name: 'Gemini', url: 'https://jobs.lever.co/gemini' },
    { slug: 'circle', name: 'Circle', url: 'https://jobs.lever.co/circle' },
    { slug: 'chainalysis', name: 'Chainalysis', url: 'https://jobs.lever.co/chainalysis' },

    // FinTech
    { slug: 'stripe', name: 'Stripe', url: 'https://jobs.lever.co/stripe' },

    // LATAM Companies
    { slug: 'yuno', name: 'Yuno', url: 'https://jobs.lever.co/yuno' },
    { slug: 'payclip', name: 'Clip', url: 'https://jobs.lever.co/payclip' },
    { slug: 'kavak', name: 'Kavak', url: 'https://jobs.lever.co/kavak' },
    { slug: 'bitso', name: 'Bitso', url: 'https://jobs.lever.co/bitso' },
    { slug: 'kushki', name: 'Kushki', url: 'https://jobs.lever.co/kushki' },
    { slug: 'rappi', name: 'Rappi', url: 'https://jobs.lever.co/rappi' },

    // Social/Communication
    { slug: 'reddit', name: 'Reddit', url: 'https://jobs.lever.co/reddit' },
    { slug: 'duolingo', name: 'Duolingo', url: 'https://jobs.lever.co/duolingo' },

    // Data/Analytics
    { slug: 'databricks', name: 'Databricks', url: 'https://jobs.lever.co/databricks' },
    { slug: 'snowflake', name: 'Snowflake', url: 'https://jobs.lever.co/snowflake' },
    { slug: 'mongodb', name: 'MongoDB', url: 'https://jobs.lever.co/mongodb' },
    { slug: 'elastic', name: 'Elastic', url: 'https://jobs.lever.co/elastic' },
    { slug: 'datadog', name: 'Datadog', url: 'https://jobs.lever.co/datadog' },

    // Dev Tools
    { slug: 'gitlab', name: 'GitLab', url: 'https://jobs.lever.co/gitlab' },
    { slug: 'figma', name: 'Figma', url: 'https://jobs.lever.co/figma' },

    // Design/Creative
    { slug: 'canva', name: 'Canva', url: 'https://jobs.lever.co/canva' },
    { slug: 'notion', name: 'Notion', url: 'https://jobs.lever.co/notion' },

    // Additional Tech Companies
    { slug: 'connectly', name: 'Connectly', url: 'https://jobs.lever.co/connectly' },
    { slug: 'workato', name: 'Workato', url: 'https://jobs.lever.co/workato' },
    { slug: 'miro', name: 'Miro', url: 'https://jobs.lever.co/miro' },
    { slug: 'grammarly', name: 'Grammarly', url: 'https://jobs.lever.co/grammarly' },
    { slug: 'loom', name: 'Loom', url: 'https://jobs.lever.co/loom' },
    { slug: 'airtable', name: 'Airtable', url: 'https://jobs.lever.co/airtable' },
    { slug: 'segment', name: 'Segment', url: 'https://jobs.lever.co/segment' },
    { slug: 'amplitude', name: 'Amplitude', url: 'https://jobs.lever.co/amplitude' },
    { slug: 'plaid', name: 'Plaid', url: 'https://jobs.lever.co/plaid' },
    { slug: 'brex', name: 'Brex', url: 'https://jobs.lever.co/brex' },
    { slug: 'ramp', name: 'Ramp', url: 'https://jobs.lever.co/ramp' },
    { slug: 'hashicorp', name: 'HashiCorp', url: 'https://jobs.lever.co/hashicorp' },
    { slug: 'vercel', name: 'Vercel', url: 'https://jobs.lever.co/vercel' },
    { slug: 'netlify', name: 'Netlify', url: 'https://jobs.lever.co/netlify' },
    { slug: 'render', name: 'Render', url: 'https://jobs.lever.co/render' },
    { slug: 'fly', name: 'Fly.io', url: 'https://jobs.lever.co/fly' },
  ];

  let createdCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com lever
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'lever',
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
        jobBoardId: leverBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: leverBoard.id,
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
  console.log('\n✅ Seed Lever concluído!');
}
