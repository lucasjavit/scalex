import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Lever
 * Execute com: npm run seed:lever
 *
 * ATUALIZADO: Agora carrega empresas do arquivo lever-companies.json
 * gerado pelo script find-lever-companies-from-remoteyeah.ts
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

  // 2. Carregar empresas do JSON file
  const jsonPath = path.join(process.cwd(), 'lever-companies.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Arquivo lever-companies.json não encontrado');
    console.log('💡 Execute o script de descoberta primeiro:');
    console.log('   npx ts-node scripts/find-lever-companies-from-remoteyeah.ts');
    return;
  }

  const leverData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const companies = leverData.companies.map((c: any) => ({
    slug: c.slug,
    name: c.name,
    url: `https://api.lever.co/v0/postings/${c.slug}`,
  }));

  console.log(`📋 ${companies.length} empresas para processar (de ${leverData.source})`);

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
