import { DataSource } from 'typeorm';

/**
 * Script para popular rss_feeds com as categorias do We Work Remotely
 * Execute com: npm run seed:weworkremotely-feeds
 */
export async function seedWeWorkRemotelyFeeds(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const rssFeedRepo = dataSource.getRepository('rss_feeds');

  console.log('🌱 Iniciando seed dos RSS feeds do We Work Remotely...');

  // 1. Buscar o job_board "weworkremotely"
  const weworkremotelyBoard = await jobBoardRepo.findOne({
    where: { slug: 'weworkremotely' },
  });

  if (!weworkremotelyBoard) {
    console.error('❌ Job board "weworkremotely" não encontrado');
    console.log('💡 Execute o seed de agregadores primeiro: npm run seed:aggregators');
    return;
  }

  console.log('✅ Job board "weworkremotely" encontrado');

  // 2. Lista de RSS feeds do We Work Remotely
  const rssFeeds = [
    // Programming & Development
    {
      url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
      category: 'Programming',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
      category: 'Full-Stack Programming',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss',
      category: 'Front-End Programming',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
      category: 'Back-End Programming',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss',
      category: 'DevOps and Sysadmin',
    },

    // Design & Creative
    {
      url: 'https://weworkremotely.com/categories/remote-design-jobs.rss',
      category: 'Design',
    },

    // Product & Management
    {
      url: 'https://weworkremotely.com/categories/remote-product-jobs.rss',
      category: 'Product',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-management-exec-jobs.rss',
      category: 'Management and Finance',
    },

    // Business & Support
    {
      url: 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss',
      category: 'Customer Support',
    },
    {
      url: 'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
      category: 'Sales and Marketing',
    },

    // Other
    {
      url: 'https://weworkremotely.com/categories/all-other-remote-jobs.rss',
      category: 'All Other Remote Jobs',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const feedData of rssFeeds) {
    const existing = await rssFeedRepo.findOne({
      where: {
        jobBoardId: weworkremotelyBoard.id,
        url: feedData.url,
      },
    });

    if (!existing) {
      await rssFeedRepo.save({
        jobBoardId: weworkremotelyBoard.id,
        url: feedData.url,
        category: feedData.category,
        enabled: true,
        scrapingStatus: null,
        lastScrapedAt: null,
        errorMessage: null,
      });
      created++;
      console.log(`  ✅ RSS feed criado: ${feedData.category}`);
    } else {
      skipped++;
      console.log(`  ℹ️  RSS feed já existe: ${feedData.category}`);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • RSS feeds criados: ${created}`);
  console.log(`  • RSS feeds já existentes: ${skipped}`);
  console.log('\n✅ Seed We Work Remotely RSS feeds concluído!');
}
