import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com empresas do Remotive
 * Remotive tem API pública, mas podemos rastrear empresas específicas que postam frequentemente
 * Execute com: npm run seed:remotive-companies
 */
export async function seedRemotiveCompanies(dataSource: DataSource) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Remotive...');

  // 1. Criar/buscar o job board "remotive"
  let remotiveBoard = await jobBoardRepo.findOne({
    where: { slug: 'remotive' },
  });

  if (!remotiveBoard) {
    remotiveBoard = await jobBoardRepo.save({
      slug: 'remotive',
      name: 'Remotive',
      url: 'https://remotive.com',
      scraper: 'remotive',
      enabled: true,
      priority: 4,
      description: 'Agregador de vagas remotas com comunidade ativa',
    });
    console.log('✅ Job board "remotive" criado');
  } else {
    console.log('ℹ️  Job board "remotive" já existe');
  }

  // 2. Lista de empresas que frequentemente postam no Remotive
  // Remotive tem API: https://remotive.com/api/remote-jobs?company_name={company}
  // Mas também podemos buscar por empresa na API geral
  const companies = [
    // 🚀 Tech Giants & Unicorns
    { slug: 'stripe', name: 'Stripe', description: 'Payment infrastructure' },
    { slug: 'airbnb', name: 'Airbnb', description: 'Vacation rentals and experiences' },
    { slug: 'coinbase', name: 'Coinbase', description: 'Cryptocurrency exchange' },
    { slug: 'notion', name: 'Notion', description: 'Productivity and note-taking' },
    { slug: 'figma', name: 'Figma', description: 'Design and prototyping' },
    { slug: 'github', name: 'GitHub', description: 'Code hosting platform' },
    { slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
    { slug: 'shopify', name: 'Shopify', description: 'E-commerce platform' },
    { slug: 'dropbox', name: 'Dropbox', description: 'Cloud storage' },
    { slug: 'automattic', name: 'Automattic', description: 'WordPress.com' },
    { slug: 'buffer', name: 'Buffer', description: 'Social media management' },
    { slug: 'toptal', name: 'Toptal', description: 'Freelance talent network' },
    { slug: 'zapier', name: 'Zapier', description: 'Automation platform' },
    { slug: 'basecamp', name: 'Basecamp', description: 'Project management' },
    { slug: '37signals', name: '37signals', description: 'Basecamp, HEY' },
    { slug: 'duckduckgo', name: 'DuckDuckGo', description: 'Privacy-focused search' },
    { slug: 'mozilla', name: 'Mozilla', description: 'Firefox, web standards' },
    { slug: 'elastic', name: 'Elastic', description: 'Search and analytics' },
    { slug: 'mongodb', name: 'MongoDB', description: 'NoSQL database' },
    { slug: 'redis', name: 'Redis', description: 'In-memory database' },
    { slug: 'datadog', name: 'Datadog', description: 'Monitoring and analytics' },
    { slug: 'newrelic', name: 'New Relic', description: 'Observability platform' },
    { slug: 'sentry', name: 'Sentry', description: 'Error tracking' },
    { slug: 'rollbar', name: 'Rollbar', description: 'Error tracking' },
    { slug: 'cloudflare', name: 'Cloudflare', description: 'CDN and security' },
    { slug: 'fastly', name: 'Fastly', description: 'Edge cloud platform' },
    { slug: 'twilio', name: 'Twilio', description: 'Communications APIs' },
    { slug: 'auth0', name: 'Auth0', description: 'Identity platform' },
    { slug: 'okta', name: 'Okta', description: 'Identity management' },
    { slug: '1password', name: '1Password', description: 'Password manager' },
    { slug: 'lastpass', name: 'LastPass', description: 'Password manager' },
    { slug: 'hashicorp', name: 'HashiCorp', description: 'Infrastructure tools' },
    { slug: 'circleci', name: 'CircleCI', description: 'CI/CD platform' },
    { slug: 'travisci', name: 'Travis CI', description: 'CI/CD platform' },
    { slug: 'netlify', name: 'Netlify', description: 'Web hosting' },
    { slug: 'vercel', name: 'Vercel', description: 'Frontend cloud platform' },
    { slug: 'render', name: 'Render', description: 'Cloud hosting' },
    { slug: 'railway', name: 'Railway', description: 'Cloud platform' },
    { slug: 'fly', name: 'Fly.io', description: 'Edge computing' },
    { slug: 'planetscale', name: 'PlanetScale', description: 'MySQL platform' },
    { slug: 'supabase', name: 'Supabase', description: 'Firebase alternative' },
    { slug: 'convex', name: 'Convex', description: 'Backend platform' },
    { slug: 'firebase', name: 'Firebase', description: 'Google backend' },
    { slug: 'aws', name: 'AWS', description: 'Amazon Web Services' },
    { slug: 'gcp', name: 'Google Cloud', description: 'Google Cloud Platform' },
    { slug: 'azure', name: 'Microsoft Azure', description: 'Cloud platform' },
    { slug: 'digitalocean', name: 'DigitalOcean', description: 'Cloud hosting' },
    { slug: 'heroku', name: 'Heroku', description: 'Platform as a service' },

    // 💰 FinTech
    { slug: 'chime', name: 'Chime', description: 'Mobile banking' },
    { slug: 'robinhood', name: 'Robinhood', description: 'Stock trading app' },
    { slug: 'square', name: 'Square', description: 'Payment processing' },
    { slug: 'plaid', name: 'Plaid', description: 'Financial services API' },
    { slug: 'brex', name: 'Brex', description: 'Corporate cards' },
    { slug: 'ramp', name: 'Ramp', description: 'Corporate finance' },
    { slug: 'mercury', name: 'Mercury', description: 'Banking for startups' },
    { slug: 'gusto', name: 'Gusto', description: 'Payroll and benefits' },
    { slug: 'deel', name: 'Deel', description: 'Global payroll' },
    { slug: 'wise', name: 'Wise', description: 'Money transfer' },
    { slug: 'revolut', name: 'Revolut', description: 'Digital banking' },
    { slug: 'n26', name: 'N26', description: 'Digital banking' },
    { slug: 'affirm', name: 'Affirm', description: 'Buy now pay later' },
    { slug: 'klarna', name: 'Klarna', description: 'Buy now pay later' },
    { slug: 'paypal', name: 'PayPal', description: 'Payments' },
    { slug: 'adyen', name: 'Adyen', description: 'Payments' },

    // 🤖 AI & Machine Learning
    { slug: 'openai', name: 'OpenAI', description: 'AI research and deployment' },
    { slug: 'anthropic', name: 'Anthropic', description: 'AI safety research' },
    { slug: 'cohere', name: 'Cohere', description: 'Enterprise AI' },
    { slug: 'scale', name: 'Scale AI', description: 'AI data platform' },
    { slug: 'huggingface', name: 'Hugging Face', description: 'ML model hub' },
    { slug: 'replicate', name: 'Replicate', description: 'ML model deployment' },
    { slug: 'weights-biases', name: 'Weights & Biases', description: 'ML platform' },

    // 🛠️ SaaS & B2B
    { slug: 'salesforce', name: 'Salesforce', description: 'CRM' },
    { slug: 'hubspot', name: 'HubSpot', description: 'Marketing and sales software' },
    { slug: 'atlassian', name: 'Atlassian', description: 'Jira, Confluence' },
    { slug: 'slack', name: 'Slack', description: 'Team messaging' },
    { slug: 'zoom', name: 'Zoom', description: 'Video conferencing' },
    { slug: 'asana', name: 'Asana', description: 'Project management' },
    { slug: 'airtable', name: 'Airtable', description: 'Collaborative database' },
    { slug: 'monday', name: 'Monday.com', description: 'Work OS' },
    { slug: 'clickup', name: 'ClickUp', description: 'Productivity platform' },
    { slug: 'miro', name: 'Miro', description: 'Online whiteboard' },
    { slug: 'webflow', name: 'Webflow', description: 'No-code website builder' },
    { slug: 'canva', name: 'Canva', description: 'Graphic design platform' },
    { slug: 'intercom', name: 'Intercom', description: 'Customer messaging' },
    { slug: 'zendesk', name: 'Zendesk', description: 'Customer service' },
    { slug: 'loom', name: 'Loom', description: 'Video messaging' },
    { slug: 'grammarly', name: 'Grammarly', description: 'Writing assistant' },
    { slug: 'calendly', name: 'Calendly', description: 'Scheduling platform' },
    { slug: 'roam', name: 'Roam Research', description: 'Note-taking' },
    { slug: 'obsidian', name: 'Obsidian', description: 'Knowledge base' },
    { slug: 'linear', name: 'Linear', description: 'Issue tracking' },
    { slug: 'jira', name: 'Jira', description: 'Project management' },
    { slug: 'confluence', name: 'Confluence', description: 'Team collaboration' },

    // 🎮 Gaming & Entertainment
    { slug: 'epic', name: 'Epic Games', description: 'Gaming (Fortnite, Unreal)' },
    { slug: 'riot', name: 'Riot Games', description: 'Gaming (League of Legends)' },
    { slug: 'unity', name: 'Unity', description: 'Game engine' },
    { slug: 'roblox', name: 'Roblox', description: 'User-generated games' },
    { slug: 'twitch', name: 'Twitch', description: 'Live streaming' },
    { slug: 'spotify', name: 'Spotify', description: 'Music streaming' },
    { slug: 'netflix', name: 'Netflix', description: 'Streaming service' },

    // 🛒 E-commerce & Marketplaces
    { slug: 'etsy', name: 'Etsy', description: 'Handmade marketplace' },
    { slug: 'wayfair', name: 'Wayfair', description: 'Home goods' },
    { slug: 'stockx', name: 'StockX', description: 'Sneaker marketplace' },
    { slug: 'poshmark', name: 'Poshmark', description: 'Fashion marketplace' },
    { slug: 'faire', name: 'Faire', description: 'Wholesale marketplace' },
    { slug: 'flexport', name: 'Flexport', description: 'Freight forwarding' },
    { slug: 'shippo', name: 'Shippo', description: 'Shipping API' },

    // 🏥 HealthTech
    { slug: 'oscar', name: 'Oscar Health', description: 'Health insurance' },
    { slug: 'headway', name: 'Headway', description: 'Mental health' },
    { slug: 'ro', name: 'Ro', description: 'Telehealth' },
    { slug: 'hims', name: 'Hims & Hers', description: 'Telehealth' },
    { slug: 'tempus', name: 'Tempus', description: 'AI healthcare' },
    { slug: '23andme', name: '23andMe', description: 'Genetic testing' },

    // 🏠 Real Estate Tech
    { slug: 'opendoor', name: 'Opendoor', description: 'iBuying' },
    { slug: 'compass', name: 'Compass', description: 'Real estate platform' },
    { slug: 'zillow', name: 'Zillow', description: 'Real estate platform' },
    { slug: 'redfin', name: 'Redfin', description: 'Real estate tech' },

    // 🌍 Travel & Hospitality
    { slug: 'booking', name: 'Booking.com', description: 'Travel booking' },
    { slug: 'expedia', name: 'Expedia', description: 'Travel booking' },
    { slug: 'tripadvisor', name: 'TripAdvisor', description: 'Travel reviews' },

    // 🎓 EdTech
    { slug: 'coursera', name: 'Coursera', description: 'Online learning' },
    { slug: 'udemy', name: 'Udemy', description: 'Online courses' },
    { slug: 'khan', name: 'Khan Academy', description: 'Free education' },
    { slug: 'codecademy', name: 'Codecademy', description: 'Coding education' },
    { slug: 'pluralsight', name: 'Pluralsight', description: 'Tech training' },
    { slug: 'duolingo', name: 'Duolingo', description: 'Language learning' },

    // 🔒 Security & Compliance
    { slug: 'crowdstrike', name: 'CrowdStrike', description: 'Cybersecurity' },
    { slug: 'paloalto', name: 'Palo Alto Networks', description: 'Cybersecurity' },
    { slug: 'vanta', name: 'Vanta', description: 'Security compliance' },
    { slug: 'drata', name: 'Drata', description: 'Security compliance' },
    { slug: 'secureframe', name: 'Secureframe', description: 'Compliance platform' },

    // 🌎 LATAM Companies - BRASIL
    { slug: 'nubank', name: 'Nubank', description: 'Digital bank Brasil' },
    { slug: 'mercadolibre', name: 'Mercado Libre', description: 'E-commerce LATAM' },
    { slug: 'rappi', name: 'Rappi', description: 'Super app delivery LATAM' },
    { slug: 'quintoandar', name: 'QuintoAndar', description: 'PropTech Brasil' },
    { slug: 'loft', name: 'Loft', description: 'Real estate tech Brasil' },
    { slug: 'creditas', name: 'Creditas', description: 'FinTech Brasil' },
    { slug: 'stone', name: 'Stone', description: 'Payments Brasil' },
    { slug: 'ifood', name: 'iFood', description: 'Food delivery Brasil' },
    { slug: 'vtex', name: 'VTEX', description: 'E-commerce platform Brasil' },
    { slug: 'wildlife', name: 'Wildlife Studios', description: 'Mobile gaming Brasil' },
    { slug: 'picpay', name: 'PicPay', description: 'Digital wallet Brasil' },
    { slug: 'banco-inter', name: 'Banco Inter', description: 'Digital bank Brasil' },
    { slug: 'c6-bank', name: 'C6 Bank', description: 'Digital bank Brasil' },
    { slug: 'merama', name: 'Merama', description: 'E-commerce aggregator LATAM' },
    { slug: 'madeira-madeira', name: 'MadeiraMadeira', description: 'E-commerce Brasil' },
    { slug: 'olist', name: 'Olist', description: 'E-commerce marketplace Brasil' },
    { slug: 'loggi', name: 'Loggi', description: 'Logistics Brasil' },
    { slug: 'ebanx', name: 'EBANX', description: 'Cross-border payments Brasil' },
    { slug: 'pagseguro', name: 'PagSeguro', description: 'Payments Brasil' },
    { slug: 'gympass', name: 'Gympass', description: 'Corporate wellness Brasil' },
    { slug: 'resultados-digitais', name: 'RD Station', description: 'Marketing automation Brasil' },
    { slug: 'totvs', name: 'TOTVS', description: 'Enterprise software Brasil' },
    { slug: 'ciandt', name: 'CI&T', description: 'Digital transformation Brasil' },
    { slug: 'thoughtworks', name: 'Thoughtworks', description: 'Software consultancy' },
    { slug: 'accenture', name: 'Accenture', description: 'Consulting' },
    { slug: 'capgemini', name: 'Capgemini', description: 'Consulting' },
    { slug: 'cognizant', name: 'Cognizant', description: 'IT services' },
    { slug: 'wipro', name: 'Wipro', description: 'IT services' },
    { slug: 'tcs', name: 'TCS', description: 'IT services' },
    { slug: 'infosys', name: 'Infosys', description: 'IT services' },
    { slug: 'epam', name: 'EPAM', description: 'Software engineering' },
    { slug: 'andela', name: 'Andela', description: 'Remote engineering' },
    { slug: 'turing', name: 'Turing', description: 'Remote engineering' },
    { slug: 'crossover', name: 'Crossover', description: 'Remote work platform' },

    // 🌎 LATAM Companies - MÉXICO
    { slug: 'clip', name: 'Clip', description: 'Payments México' },
    { slug: 'konfio', name: 'Konfio', description: 'FinTech lending México' },
    { slug: 'credijusto', name: 'Credijusto', description: 'FinTech México' },
    { slug: 'bitso', name: 'Bitso', description: 'Crypto exchange México' },
    { slug: 'stori', name: 'Stori', description: 'Digital bank México' },
    { slug: 'justo', name: 'Justo', description: 'Grocery delivery México' },
    { slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery LATAM' },
    { slug: 'softtek', name: 'Softtek', description: 'IT services México' },
    { slug: 'wizeline', name: 'Wizeline', description: 'Product development México' },
    { slug: 'globant', name: 'Globant', description: 'Digital transformation' },
    { slug: 'endava', name: 'Endava', description: 'Software engineering' },
    { slug: 'belatrix', name: 'Belatrix', description: 'Software development' },
    { slug: 'bairesdev', name: 'BairesDev', description: 'Software development LATAM' },
    { slug: 'rootstrap', name: 'Rootstrap', description: 'Product development' },
    { slug: 'abstracta', name: 'Abstracta', description: 'QA & Testing' },

    // 🌎 LATAM Companies - ARGENTINA
    { slug: 'uala', name: 'Ualá', description: 'FinTech Argentina' },
    { slug: 'mercadopago', name: 'Mercado Pago', description: 'Payments Argentina' },
    { slug: 'despegar', name: 'Despegar', description: 'Travel booking Argentina' },
    { slug: 'pedidosya', name: 'PedidosYa', description: 'Food delivery Argentina' },
    { slug: 'wolox', name: 'Wolox', description: 'Software development Argentina' },
    { slug: 'baufest', name: 'Baufest', description: 'Software development Argentina' },
    { slug: 'intive', name: 'Intive', description: 'Digital product development' },

    // 🌎 LATAM Companies - COLÔMBIA
    { slug: 'lulo-bank', name: 'Lulo Bank', description: 'Digital bank Colômbia' },
    { slug: 'nequi', name: 'Nequi', description: 'Digital wallet Colômbia' },
    { slug: 'daviplata', name: 'Daviplata', description: 'Digital wallet Colômbia' },
    { slug: 'addi', name: 'Addi', description: 'BNPL Colômbia' },
    { slug: 'tul', name: 'Tul', description: 'FinTech Colômbia' },

    // 🌎 LATAM Companies - OUTROS
    { slug: 'dlocal', name: 'dLocal', description: 'Cross-border payments Uruguai' },
    { slug: 'kushki', name: 'Kushki', description: 'Payments Equador' },
    { slug: 'yuno', name: 'Yuno', description: 'Payments orchestration LATAM' },
    { slug: 'clara', name: 'Clara', description: 'Corporate cards México/Brasil' },
    { slug: 'connectly', name: 'Connectly', description: 'Customer messaging LATAM' },
    { slug: 'bluelight', name: 'Bluelight Consulting', description: 'Software consultancy LATAM' },
    { slug: 'idt', name: 'IDT', description: 'Telecom & fintech LATAM' },
    { slug: 'welocalize', name: 'Welocalize', description: 'Localization services México' },
    { slug: 'workana', name: 'Workana', description: 'Freelance marketplace LATAM' },
    { slug: 'onfly', name: 'Onfly', description: 'Travel and expense management LATAM' },
    { slug: 'qubika', name: 'Qubika', description: 'Software development Uruguai' },
    { slug: 'uds', name: 'UDS Tecnologia', description: 'Software development Brasil' },

    // 🚀 Remote-First Companies (frequentemente no Remotive)
    { slug: 'doist', name: 'Doist', description: 'Todoist, Twist' },
    { slug: 'automattic', name: 'Automattic', description: 'WordPress.com' },
    { slug: 'help-scout', name: 'Help Scout', description: 'Customer support' },
    { slug: 'close', name: 'Close', description: 'CRM for sales' },
    { slug: 'groove', name: 'Groove', description: 'Customer support' },
    { slug: 'convertkit', name: 'ConvertKit', description: 'Email marketing' },
    { slug: 'dribbble', name: 'Dribbble', description: 'Design community' },
    { slug: 'behance', name: 'Behance', description: 'Creative portfolio' },
    { slug: 'upwork', name: 'Upwork', description: 'Freelance marketplace' },
    { slug: 'fiverr', name: 'Fiverr', description: 'Freelance marketplace' },
    { slug: 'freelancer', name: 'Freelancer', description: 'Freelance marketplace' },
    { slug: 'peopleperhour', name: 'PeoplePerHour', description: 'Freelance marketplace' },
    { slug: 'remote', name: 'Remote', description: 'Global HR platform' },
    { slug: 'oyster', name: 'Oyster', description: 'Global employment platform' },
    { slug: 'papaya', name: 'Papaya Global', description: 'Global payroll' },
    { slug: 'boundless', name: 'Boundless', description: 'Employment platform' },
    { slug: 'lano', name: 'Lano', description: 'Global payroll' },
    { slug: 'remote-first', name: 'Remote First', description: 'Remote work tools' },
    { slug: 'remoteok', name: 'RemoteOK', description: 'Remote job board' },
    { slug: 'remotive', name: 'Remotive', description: 'Remote job board' },
    { slug: 'flexjobs', name: 'FlexJobs', description: 'Remote job board' },
    { slug: 'dynamite-jobs', name: 'Dynamite Jobs', description: 'Remote job board' },
    { slug: 'justremote', name: 'JustRemote', description: 'Remote job board' },
    { slug: 'remote-co', name: 'Remote.co', description: 'Remote job board' },
    { slug: 'working-nomads', name: 'Working Nomads', description: 'Remote job board' },
    { slug: 'jobspresso', name: 'Jobspresso', description: 'Remote job board' },
    { slug: 'pangian', name: 'Pangian', description: 'Remote job board' },
    { slug: 'skip-the-drive', name: 'Skip The Drive', description: 'Remote job board' },
    { slug: 'virtual-vocations', name: 'Virtual Vocations', description: 'Remote job board' },
    { slug: 'weworkremotely', name: 'We Work Remotely', description: 'Remote job board' },
  ];

  let createdCompanies = 0;
  let updatedCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com remotive
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'remotive',
        featured: false,
        featuredOrder: 0,
        rating: 0,
        reviewCount: 0,
        totalJobs: 0,
        metadata: {
          description: companyData.description,
        },
      });
      createdCompanies++;
      console.log(`  ✅ Empresa criada: ${companyData.name}`);
    } else {
      // Se a empresa já existe, atualizar o metadata se necessário
      if (!company.metadata?.description) {
        company.metadata = {
          ...company.metadata,
          description: companyData.description,
        };
        await companyRepo.save(company);
        updatedCompanies++;
        console.log(`  🔄 Metadata atualizado: ${companyData.name}`);
      }
    }

    // 3.2. Criar a relação job_board_companies
    // Remotive tem API: https://remotive.com/api/remote-jobs?company_name={company}
    const existingRelation = await jbcRepo.findOne({
      where: {
        jobBoardId: remotiveBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: remotiveBoard.id,
        companyId: company.id,
        scraperUrl: `https://remotive.com/api/remote-jobs?company_name=${encodeURIComponent(companyData.name)}&limit=100`,
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
  console.log('\n✅ Seed Remotive Companies concluído!');
}

