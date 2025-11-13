import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards com as plataformas ATS
 * ATS = Applicant Tracking Systems (Lever, Greenhouse, Workable, Ashby)
 * Essas plataformas precisam de job_board_companies para scraping por empresa
 * Execute automaticamente via DatabaseInitService
 */
export async function seedATSPlatforms(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');

  console.log('🌱 Iniciando seed das plataformas ATS...');

  // Lista de plataformas ATS (sistemas que empresas usam para hospedar vagas)
  const atsPlatforms = [
    {
      slug: 'lever',
      name: 'Lever',
      url: 'https://jobs.lever.co',
      scraper: 'lever',
      priority: 1,
      description: 'Plataforma ATS usada por empresas tech (Coinbase, Figma, Netflix, etc)',
    },
    {
      slug: 'greenhouse',
      name: 'Greenhouse',
      url: 'https://boards.greenhouse.io',
      scraper: 'greenhouse',
      priority: 1,
      description: 'Plataforma ATS usada por empresas tech (Airbnb, Stripe, Shopify, etc)',
    },
    {
      slug: 'workable',
      name: 'Workable',
      url: 'https://apply.workable.com',
      scraper: 'workable',
      priority: 2,
      description: 'Plataforma ATS para pequenas e médias empresas',
    },
    {
      slug: 'ashby',
      name: 'Ashby',
      url: 'https://jobs.ashbyhq.com',
      scraper: 'ashby',
      priority: 2,
      description: 'Plataforma ATS moderna focada em dados e analytics',
    },
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const atsData of atsPlatforms) {
    const existing = await jobBoardRepo.findOne({
      where: { slug: atsData.slug }
    });

    if (!existing) {
      await jobBoardRepo.save({
        ...atsData,
        enabled: true
      });
      created++;
      console.log(`  ✅ Plataforma ATS criada: ${atsData.name}`);
    } else {
      // Atualiza informações se necessário
      const needsUpdate =
        existing.name !== atsData.name ||
        existing.url !== atsData.url ||
        existing.description !== atsData.description ||
        existing.priority !== atsData.priority;

      if (needsUpdate) {
        await jobBoardRepo.update(existing.id, {
          name: atsData.name,
          url: atsData.url,
          description: atsData.description,
          priority: atsData.priority,
        });
        updated++;
        console.log(`  🔄 Plataforma ATS atualizada: ${atsData.name}`);
      } else {
        skipped++;
        console.log(`  ℹ️  Plataforma ATS já existe: ${atsData.name}`);
      }
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Plataformas ATS criadas: ${created}`);
  console.log(`  • Plataformas ATS atualizadas: ${updated}`);
  console.log(`  • Plataformas ATS já existentes: ${skipped}`);
  console.log('\n✅ Seed de plataformas ATS concluído!');
  console.log('💡 Plataformas ATS precisam de job_board_companies para funcionar.');
}
