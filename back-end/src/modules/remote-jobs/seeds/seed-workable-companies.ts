import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Workable
 * Execute com: npm run seed:workable
 */
export async function seedWorkableCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Workable...');

  // 1. Criar/buscar o job board "workable"
  let workableBoard = await jobBoardRepo.findOne({
    where: { slug: 'workable' },
  });

  if (!workableBoard) {
    workableBoard = await jobBoardRepo.save({
      slug: 'workable',
      name: 'Workable',
      url: 'https://apply.workable.com',
      scraper: 'workable',
      enabled: true,
      priority: 2,
      description: 'Plataforma de ATS usada por múltiplas empresas tech',
    });
    console.log('✅ Job board "workable" criado');
  } else {
    console.log('ℹ️  Job board "workable" já existe');
  }

  // 2. Lista de empresas do Workable (as 30 hardcoded)
  const companies = [
    { slug: 'revolut', name: 'Revolut', url: 'https://apply.workable.com/revolut/' },
    { slug: 'beat', name: 'Beat', url: 'https://apply.workable.com/beat/' },
    { slug: 'n26', name: 'N26', url: 'https://apply.workable.com/n26/' },
    { slug: 'vivawallet', name: 'Viva Wallet', url: 'https://apply.workable.com/vivawallet/' },
    { slug: 'blueground', name: 'Blueground', url: 'https://apply.workable.com/blueground/' },
    { slug: 'taxfix', name: 'Taxfix', url: 'https://apply.workable.com/taxfix/' },
    { slug: 'personio', name: 'Personio', url: 'https://apply.workable.com/personio/' },
    { slug: 'getground', name: 'GetGround', url: 'https://apply.workable.com/getground/' },
    { slug: 'scalable-capital', name: 'Scalable Capital', url: 'https://apply.workable.com/scalable-capital/' },
    { slug: 'wefox', name: 'Wefox', url: 'https://apply.workable.com/wefox/' },
    { slug: 'contentful', name: 'Contentful', url: 'https://apply.workable.com/contentful/' },
    { slug: 'gorillas', name: 'Gorillas', url: 'https://apply.workable.com/gorillas/' },
    { slug: 'adjust', name: 'Adjust', url: 'https://apply.workable.com/adjust/' },
    { slug: 'zalando', name: 'Zalando', url: 'https://apply.workable.com/zalando/' },
    { slug: 'helpling', name: 'Helpling', url: 'https://apply.workable.com/helpling/' },
    { slug: 'mambu', name: 'Mambu', url: 'https://apply.workable.com/mambu/' },
    { slug: 'aircall', name: 'Aircall', url: 'https://apply.workable.com/aircall/' },
    { slug: 'spendesk', name: 'Spendesk', url: 'https://apply.workable.com/spendesk/' },
    { slug: 'qonto', name: 'Qonto', url: 'https://apply.workable.com/qonto/' },
    { slug: 'smallpdf', name: 'Smallpdf', url: 'https://apply.workable.com/smallpdf/' },
    { slug: 'infarm', name: 'Infarm', url: 'https://apply.workable.com/infarm/' },
    { slug: 'tier', name: 'TIER Mobility', url: 'https://apply.workable.com/tier/' },
    { slug: 'lilium', name: 'Lilium', url: 'https://apply.workable.com/lilium/' },
    { slug: 'flink', name: 'Flink', url: 'https://apply.workable.com/flink/' },
    { slug: 'trade-republic', name: 'Trade Republic', url: 'https://apply.workable.com/trade-republic/' },
    { slug: 'solarisbank', name: 'Solarisbank', url: 'https://apply.workable.com/solarisbank/' },
    { slug: 'moss', name: 'Moss', url: 'https://apply.workable.com/moss/' },
    { slug: 'razor-group', name: 'Razor Group', url: 'https://apply.workable.com/razor-group/' },
    { slug: 'camunda', name: 'Camunda', url: 'https://apply.workable.com/camunda/' },
    { slug: 'celonis', name: 'Celonis', url: 'https://apply.workable.com/celonis/' },
  ];

  let createdCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com workable
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'workable',
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
        jobBoardId: workableBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: workableBoard.id,
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
  console.log('\n✅ Seed concluído!');
}
