import { DataSource } from 'typeorm';

/**
 * Script para popular rss_feeds com as categorias da API do Remotive
 * Execute com: npm run seed:remotive-feeds
 */
export async function seedRemotiveFeeds(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const rssFeedRepo = dataSource.getRepository('rss_feeds');

  console.log('🌱 Iniciando seed dos API endpoints do Remotive...');

  // 1. Buscar o job_board "remotive"
  const remotiveBoard = await jobBoardRepo.findOne({
    where: { slug: 'remotive' },
  });

  if (!remotiveBoard) {
    console.error('❌ Job board "remotive" não encontrado');
    console.log('💡 Execute o seed de agregadores primeiro: npm run seed:aggregators');
    return;
  }

  console.log('✅ Job board "remotive" encontrado');

  // 2. Lista de categorias da API do Remotive
  // API Pattern: https://remotive.com/api/remote-jobs?category=CATEGORY&limit=100
  const categories = [
    { category: 'software-dev', description: 'Software Development' },
    { category: 'devops', description: 'DevOps & Sysadmin' },
    { category: 'data', description: 'Data Science & Analytics' },
    { category: 'design', description: 'Design' },
    { category: 'product', description: 'Product' },
    { category: 'customer-support', description: 'Customer Support' },
    { category: 'sales', description: 'Sales' },
    { category: 'marketing', description: 'Marketing' },
    { category: 'writing', description: 'Writing & Content' },
    { category: 'finance', description: 'Finance & Legal' },
    { category: 'management', description: 'Management & Exec' },
    { category: 'all', description: 'All Categories' },
  ];

  let created = 0;
  let skipped = 0;

  for (const cat of categories) {
    const url = `https://remotive.com/api/remote-jobs?category=${cat.category}&limit=100`;

    const existing = await rssFeedRepo.findOne({
      where: {
        jobBoardId: remotiveBoard.id,
        url: url,
      },
    });

    if (!existing) {
      await rssFeedRepo.save({
        jobBoardId: remotiveBoard.id,
        url: url,
        category: cat.description,
        enabled: true,
        scrapingStatus: null,
        lastScrapedAt: null,
        errorMessage: null,
      });
      created++;
      console.log(`  ✅ API endpoint criado: ${cat.description}`);
    } else {
      skipped++;
      console.log(`  ℹ️  API endpoint já existe: ${cat.description}`);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • API endpoints criados: ${created}`);
  console.log(`  • API endpoints já existentes: ${skipped}`);
  console.log('\n✅ Seed Remotive API endpoints concluído!');
}
