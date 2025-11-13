import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para popular companies com empresas do RemoteYeah
 * Execute com: npm run seed:remoteyeah
 */
export async function seedRemoteYeahCompanies(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository('companies');
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const jobBoardCompanyRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas do RemoteYeah...');

  // Carrega JSON file (está na raiz do projeto back-end)
  const jsonPath = path.join(process.cwd(), 'remoteyeah-companies.json');
  const remoteyeahData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 1. Buscar job_board remoteyeah
  const remoteyeahBoard = await jobBoardRepo.findOne({
    where: { slug: 'remoteyeah' },
  });

  if (!remoteyeahBoard) {
    console.error('❌ Job board "remoteyeah" não encontrado');
    console.log('💡 Execute o seed de agregadores primeiro: npm run seed:aggregators');
    return;
  }

  console.log('✅ Job board "remoteyeah" encontrado');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let relationsCreated = 0;

  const companies = remoteyeahData.companies;
  console.log(`📋 ${companies.length} empresas para processar\n`);

  for (const companyData of companies) {
    try {
      // Verifica se empresa já existe
      const existing = await companyRepo.findOne({
        where: { slug: companyData.slug },
      });

      let companyId: string;

      if (!existing) {
        // Cria nova empresa
        const newCompany = await companyRepo.save({
          slug: companyData.slug,
          name: companyData.name,
          platform: 'remoteyeah',
          website: companyData.url,
        });
        companyId = newCompany.id;
        created++;
        console.log(`  ✅ Empresa criada: ${companyData.name}`);
      } else {
        // Atualiza se necessário
        if (existing.platform !== 'remoteyeah') {
          await companyRepo.update(existing.id, {
            platform: 'remoteyeah',
            website: companyData.url,
          });
          updated++;
          console.log(`  🔄 Empresa atualizada: ${companyData.name}`);
        } else {
          skipped++;
          console.log(`  ℹ️  Empresa já existe: ${companyData.name}`);
        }
        companyId = existing.id;
      }

      // Criar relação com job_board se não existir
      const existingRelation = await jobBoardCompanyRepo.findOne({
        where: {
          companyId: companyId,
          jobBoardId: remoteyeahBoard.id,
        },
      });

      if (!existingRelation) {
        await jobBoardCompanyRepo.save({
          companyId: companyId,
          jobBoardId: remoteyeahBoard.id,
          scraperUrl: `https://remoteyeah.com/remote-companies/${companyData.slug}`,
          enabled: true,
          scrapingStatus: null,
          lastScrapedAt: null,
          errorMessage: null,
        });
        relationsCreated++;
      }
    } catch (error) {
      console.error(`  ❌ Erro ao processar ${companyData.name}:`, error.message);
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Empresas criadas: ${created}`);
  console.log(`  • Empresas atualizadas: ${updated}`);
  console.log(`  • Empresas já existentes: ${skipped}`);
  console.log(`  • Relações company-jobboard criadas: ${relationsCreated}`);
  console.log('\n✅ Seed RemoteYeah empresas concluído!');
}
