import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Ashby
 * Execute com: npm run seed:ashby
 */
export async function seedAshbyCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Ashby...');

  // 1. Criar/buscar o job board "ashby"
  let ashbyBoard = await jobBoardRepo.findOne({
    where: { slug: 'ashby' },
  });

  if (!ashbyBoard) {
    ashbyBoard = await jobBoardRepo.save({
      slug: 'ashby',
      name: 'AshbyHQ',
      url: 'https://jobs.ashbyhq.com',
      scraper: 'ashby',
      enabled: true,
      priority: 2,
      description: 'Plataforma de ATS moderna usada por startups e empresas tech',
    });
    console.log('✅ Job board "ashby" criado');
  } else {
    console.log('ℹ️  Job board "ashby" já existe');
  }

  // 2. Lista de empresas do Ashby (baseado em ashby-companies.ts)
  const companies = [
    // Tech/SaaS - Verificadas
    { slug: 'Neon', name: 'Neon', url: 'https://api.ashbyhq.com/posting-api/job-board/Neon' },
    { slug: 'Census', name: 'Census', url: 'https://api.ashbyhq.com/posting-api/job-board/Census' },
    { slug: 'Ramp', name: 'Ramp', url: 'https://api.ashbyhq.com/posting-api/job-board/Ramp' },
    { slug: 'Deel', name: 'Deel', url: 'https://api.ashbyhq.com/posting-api/job-board/Deel' },
    { slug: 'Modal', name: 'Modal', url: 'https://api.ashbyhq.com/posting-api/job-board/Modal' },
    { slug: 'Ashby', name: 'Ashby', url: 'https://api.ashbyhq.com/posting-api/job-board/Ashby' },
    { slug: 'Mercury', name: 'Mercury', url: 'https://api.ashbyhq.com/posting-api/job-board/Mercury' },
    { slug: 'Middesk', name: 'Middesk', url: 'https://api.ashbyhq.com/posting-api/job-board/Middesk' },
    { slug: 'Supabase', name: 'Supabase', url: 'https://api.ashbyhq.com/posting-api/job-board/Supabase' },
    { slug: 'Vanta', name: 'Vanta', url: 'https://api.ashbyhq.com/posting-api/job-board/Vanta' },

    // AI/ML - Verificadas
    { slug: 'Scale', name: 'Scale AI', url: 'https://api.ashbyhq.com/posting-api/job-board/Scale' },
    { slug: 'Anthropic', name: 'Anthropic', url: 'https://api.ashbyhq.com/posting-api/job-board/Anthropic' },
    { slug: 'Weights-Biases', name: 'Weights & Biases', url: 'https://api.ashbyhq.com/posting-api/job-board/Weights-Biases' },
    { slug: 'Cohere', name: 'Cohere', url: 'https://api.ashbyhq.com/posting-api/job-board/Cohere' },
    { slug: 'Harvey', name: 'Harvey', url: 'https://api.ashbyhq.com/posting-api/job-board/Harvey' },

    // FinTech - Verificadas
    { slug: 'Brex', name: 'Brex', url: 'https://api.ashbyhq.com/posting-api/job-board/Brex' },
    { slug: 'Plaid', name: 'Plaid', url: 'https://api.ashbyhq.com/posting-api/job-board/Plaid' },
    { slug: 'Stripe', name: 'Stripe', url: 'https://api.ashbyhq.com/posting-api/job-board/Stripe' },
    { slug: 'Gusto', name: 'Gusto', url: 'https://api.ashbyhq.com/posting-api/job-board/Gusto' },
    { slug: 'Modern-Treasury', name: 'Modern Treasury', url: 'https://api.ashbyhq.com/posting-api/job-board/Modern-Treasury' },

    // Developer Tools - Verificadas
    { slug: 'Vercel', name: 'Vercel', url: 'https://api.ashbyhq.com/posting-api/job-board/Vercel' },
    { slug: 'Retool', name: 'Retool', url: 'https://api.ashbyhq.com/posting-api/job-board/Retool' },
    { slug: 'Render', name: 'Render', url: 'https://api.ashbyhq.com/posting-api/job-board/Render' },
    { slug: 'Fly', name: 'Fly.io', url: 'https://api.ashbyhq.com/posting-api/job-board/Fly' },
    { slug: 'WorkOS', name: 'WorkOS', url: 'https://api.ashbyhq.com/posting-api/job-board/WorkOS' },
  ];

  let createdCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com ashby
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'ashby',
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
        jobBoardId: ashbyBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: ashbyBoard.id,
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
  console.log('\n✅ Seed Ashby concluído!');
}
