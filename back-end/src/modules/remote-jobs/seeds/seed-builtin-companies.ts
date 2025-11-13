import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Built In
 * Execute com: npm run seed:builtin
 */
export async function seedBuiltInCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Built In...');

  // 1. Criar/buscar o job board "builtin"
  let builtinBoard = await jobBoardRepo.findOne({
    where: { slug: 'builtin' },
  });

  if (!builtinBoard) {
    builtinBoard = await jobBoardRepo.save({
      slug: 'builtin',
      name: 'Built In',
      url: 'https://builtin.com',
      scraper: 'builtin',
      enabled: true,
      priority: 3,
      description: 'Agregador de vagas tech por cidade (NY, SF, LA, etc)',
    });
    console.log('✅ Job board "builtin" criado');
  } else {
    console.log('ℹ️  Job board "builtin" já existe');
  }

  // 2. Lista de empresas do Built In (apenas as VERIFICADAS)
  // Built In usa companyId numérico (armazenado no metadata)
  const companies = [
    // Grandes Tech Companies
    { companyId: 84805, slug: 'stripe', name: 'Stripe', description: 'Payment infrastructure' },
    { companyId: 25746, slug: 'airbnb', name: 'Airbnb', description: 'Vacation rentals and experiences' },
    { companyId: 51527, slug: 'coinbase', name: 'Coinbase', description: 'Cryptocurrency exchange' },
    { companyId: 66398, slug: 'notion', name: 'Notion', description: 'Productivity and note-taking' },
    { companyId: 81886, slug: 'figma', name: 'Figma', description: 'Design and prototyping' },

    // FinTech
    { companyId: 63644, slug: 'chime', name: 'Chime', description: 'Mobile banking' },
    { companyId: 38876, slug: 'robinhood', name: 'Robinhood', description: 'Stock trading app' },
    { companyId: 31849, slug: 'square', name: 'Square', description: 'Payment processing' },

    // AI/ML
    { companyId: 46735, slug: 'openai', name: 'OpenAI', description: 'AI research and deployment' },

    // SaaS
    { companyId: 37878, slug: 'airtable', name: 'Airtable', description: 'Collaborative database' },
    { companyId: 84953, slug: 'miro', name: 'Miro', description: 'Online whiteboard' },
    { companyId: 38133, slug: 'canva', name: 'Canva', description: 'Graphic design platform' },
    { companyId: 69698, slug: 'webflow', name: 'Webflow', description: 'No-code website builder' },
    { companyId: 16914, slug: 'zapier', name: 'Zapier', description: 'Automation platform' },

    // Developer Tools
    { companyId: 25817, slug: 'github', name: 'GitHub', description: 'Code hosting platform' },
    { companyId: 38479, slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
    { companyId: 26109, slug: 'datadog', name: 'Datadog', description: 'Monitoring and analytics' },
    { companyId: 54312, slug: 'postman', name: 'Postman', description: 'API development' },

    // Remote-First Companies
    { companyId: 16965, slug: 'duckduckgo', name: 'DuckDuckGo', description: 'Privacy-focused search' },
    { companyId: 24886, slug: 'automattic', name: 'Automattic', description: 'WordPress.com' },
    { companyId: 24887, slug: 'buffer', name: 'Buffer', description: 'Social media management' },
    { companyId: 24948, slug: 'toptal', name: 'Toptal', description: 'Freelance talent network' },

    // E-commerce & Retail Tech
    { companyId: 21448, slug: 'shopify', name: 'Shopify', description: 'E-commerce platform' },
    { companyId: 84997, slug: 'instacart', name: 'Instacart', description: 'Grocery delivery' },

    // Cloud & Infrastructure
    { companyId: 85053, slug: 'snowflake', name: 'Snowflake', description: 'Data warehouse' },
    { companyId: 63480, slug: 'cloudflare', name: 'Cloudflare', description: 'Web infrastructure and security' },
    { companyId: 81698, slug: 'elastic', name: 'Elastic', description: 'Search and analytics engine' },
    { companyId: 64186, slug: 'mongodb', name: 'MongoDB', description: 'NoSQL database' },

    // Enterprise SaaS
    { companyId: 82700, slug: 'salesforce', name: 'Salesforce', description: 'CRM and enterprise cloud' },
    { companyId: 85900, slug: 'hubspot', name: 'HubSpot', description: 'Marketing and sales software' },
    { companyId: 81667, slug: 'atlassian', name: 'Atlassian', description: 'Collaboration and productivity tools' },
    { companyId: 83435, slug: 'slack', name: 'Slack', description: 'Team communication platform' },

    // Developer Tools & Infrastructure
    { companyId: 69013, slug: 'twilio', name: 'Twilio', description: 'Communications APIs' },
    { companyId: 101496, slug: 'netlify', name: 'Netlify', description: 'Web hosting and automation' },
    { companyId: 101762, slug: 'vercel', name: 'Vercel', description: 'Frontend cloud platform' },
    { companyId: 54026, slug: 'auth0', name: 'Auth0', description: 'Identity and authentication' },
    { companyId: 64456, slug: 'redis', name: 'Redis', description: 'In-memory database' },
    { companyId: 63913, slug: 'hashicorp', name: 'HashiCorp', description: 'Cloud infrastructure automation' },
    { companyId: 68686, slug: 'confluent', name: 'Confluent', description: 'Data streaming platform' },
    { companyId: 88861, slug: 'plaid', name: 'Plaid', description: 'Financial services API' },

    // Media & Entertainment
    { companyId: 72094, slug: 'spotify', name: 'Spotify', description: 'Music streaming service' },

    // Productivity Tools
    { companyId: 64902, slug: 'dropbox', name: 'Dropbox', description: 'Cloud storage and collaboration' },
    { companyId: 63880, slug: 'grammarly', name: 'Grammarly', description: 'Writing assistant' },
  ];

  let createdCompanies = 0;
  let updatedCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com builtin
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'builtin',
        featured: false,
        featuredOrder: 0,
        rating: 0,
        reviewCount: 0,
        totalJobs: 0,
        metadata: {
          builtinCompanyId: companyData.companyId,
          description: companyData.description,
        },
      });
      createdCompanies++;
      console.log(`  ✅ Empresa criada: ${companyData.name} (ID: ${companyData.companyId})`);
    } else {
      // Se a empresa já existe, atualizar o metadata se necessário
      if (!company.metadata?.builtinCompanyId) {
        company.metadata = {
          ...company.metadata,
          builtinCompanyId: companyData.companyId,
        };
        await companyRepo.save(company);
        updatedCompanies++;
        console.log(`  🔄 Metadata atualizado: ${companyData.name} (ID: ${companyData.companyId})`);
      }
    }

    // 3.2. Criar a relação job_board_companies
    const existingRelation = await jbcRepo.findOne({
      where: {
        jobBoardId: builtinBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: builtinBoard.id,
        companyId: company.id,
        scraperUrl: `https://builtin.com/jobs?companyId=${companyData.companyId}&remote=true`,
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
  console.log(`  • Empresas atualizadas: ${updatedCompanies}`);
  console.log(`  • Relações criadas: ${createdRelations}`);
  console.log(`  • Relações já existentes: ${skippedRelations}`);
  console.log('\n✅ Seed Built In concluído!');
}
