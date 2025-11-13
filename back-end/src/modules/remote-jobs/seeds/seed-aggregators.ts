import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards com os agregadores de vagas
 * Agregadores NÃO precisam de job_board_companies pois não scrapem por empresa
 * Execute com: npm run seed:aggregators
 */
export async function seedAggregators(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');

  console.log('🌱 Iniciando seed dos agregadores de vagas...');

  // Lista de agregadores (sites que já centralizam vagas de múltiplas empresas)
  const aggregators = [
    {
      slug: 'wellfound',
      name: 'Wellfound',
      url: 'https://wellfound.com',
      scraper: 'wellfound',
      priority: 3,
      description: 'Agregador de vagas em startups (anteriormente AngelList Talent)',
    },
    {
      slug: 'builtin',
      name: 'Built In',
      url: 'https://builtin.com',
      scraper: 'builtin',
      priority: 3,
      description: 'Agregador de vagas tech por cidade (NY, SF, LA, etc)',
    },
    {
      slug: 'weworkremotely',
      name: 'We Work Remotely',
      url: 'https://weworkremotely.com',
      scraper: 'weworkremotely',
      priority: 4,
      description: 'Maior job board de vagas remotas do mundo',
    },
    {
      slug: 'remotive',
      name: 'Remotive',
      url: 'https://remotive.com',
      scraper: 'remotive',
      priority: 4,
      description: 'Agregador de vagas remotas com comunidade ativa',
    },
    {
      slug: 'remoteyeah',
      name: 'RemoteYeah',
      url: 'https://remoteyeah.com',
      scraper: 'remoteyeah',
      priority: 4,
      description: 'Agregador de vagas remotas curadas',
    },
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const aggData of aggregators) {
    const existing = await jobBoardRepo.findOne({
      where: { slug: aggData.slug }
    });

    if (!existing) {
      await jobBoardRepo.save({
        ...aggData,
        enabled: true
      });
      created++;
      console.log(`  ✅ Agregador criado: ${aggData.name}`);
    } else {
      // Atualiza informações se necessário
      const needsUpdate =
        existing.name !== aggData.name ||
        existing.url !== aggData.url ||
        existing.description !== aggData.description ||
        existing.priority !== aggData.priority;

      if (needsUpdate) {
        await jobBoardRepo.update(existing.id, {
          name: aggData.name,
          url: aggData.url,
          description: aggData.description,
          priority: aggData.priority,
        });
        updated++;
        console.log(`  🔄 Agregador atualizado: ${aggData.name}`);
      } else {
        skipped++;
        console.log(`  ℹ️  Agregador já existe: ${aggData.name}`);
      }
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Agregadores criados: ${created}`);
  console.log(`  • Agregadores atualizados: ${updated}`);
  console.log(`  • Agregadores já existentes: ${skipped}`);
  console.log('\n✅ Seed de agregadores concluído!');
  console.log('💡 Agregadores não usam job_board_companies - eles scrapem diretamente de uma URL central.');
}
