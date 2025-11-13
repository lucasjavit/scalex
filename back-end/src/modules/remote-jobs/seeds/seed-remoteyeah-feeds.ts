import { DataSource } from 'typeorm';

/**
 * Script para popular rss_feeds com as páginas do RemoteYeah
 * Execute com: npm run seed:remoteyeah-feeds
 */
export async function seedRemoteYeahFeeds(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const rssFeedRepo = dataSource.getRepository('rss_feeds');

  console.log('🌱 Iniciando seed das páginas do RemoteYeah...');

  // 1. Buscar o job_board "remoteyeah"
  const remoteyeahBoard = await jobBoardRepo.findOne({
    where: { slug: 'remoteyeah' },
  });

  if (!remoteyeahBoard) {
    console.error('❌ Job board "remoteyeah" não encontrado');
    console.log('💡 Execute o seed de agregadores primeiro: npm run seed:aggregators');
    return;
  }

  console.log('✅ Job board "remoteyeah" encontrado');

  // 2. Lista de páginas do RemoteYeah
  // RemoteYeah usa paginação simples: ?page=1, ?page=2, etc.
  const maxPages = 5; // Limita a 5 páginas
  const pages: Array<{ url: string; category: string }> = [];

  // Página 1 (sem query param)
  pages.push({
    url: 'https://remoteyeah.com',
    category: 'Page 1',
  });

  // Páginas 2-5
  for (let i = 2; i <= maxPages; i++) {
    pages.push({
      url: `https://remoteyeah.com?page=${i}`,
      category: `Page ${i}`,
    });
  }

  let created = 0;
  let skipped = 0;

  for (const pageData of pages) {
    const existing = await rssFeedRepo.findOne({
      where: {
        jobBoardId: remoteyeahBoard.id,
        url: pageData.url,
      },
    });

    if (!existing) {
      await rssFeedRepo.save({
        jobBoardId: remoteyeahBoard.id,
        url: pageData.url,
        category: pageData.category,
        enabled: true,
        scrapingStatus: null,
        lastScrapedAt: null,
        errorMessage: null,
      });
      created++;
      console.log(`  ✅ Página criada: ${pageData.category}`);
    } else {
      skipped++;
      console.log(`  ℹ️  Página já existe: ${pageData.category}`);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Páginas criadas: ${created}`);
  console.log(`  • Páginas já existentes: ${skipped}`);
  console.log('\n✅ Seed RemoteYeah páginas concluído!');
}
