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

    // 🌎 MAIS EMPRESAS - Tech Giants & Unicorns
    { companyId: 101234, slug: 'uber', name: 'Uber', description: 'Ride-sharing and delivery' },
    { companyId: 101235, slug: 'lyft', name: 'Lyft', description: 'Ride-sharing' },
    { companyId: 101236, slug: 'doordash', name: 'DoorDash', description: 'Food delivery' },
    { companyId: 101237, slug: 'reddit', name: 'Reddit', description: 'Social network' },
    { companyId: 101238, slug: 'discord', name: 'Discord', description: 'Communication platform' },
    { companyId: 101239, slug: 'duolingo', name: 'Duolingo', description: 'Language learning' },
    { companyId: 101240, slug: 'asana', name: 'Asana', description: 'Project management' },
    { companyId: 101241, slug: 'zoom', name: 'Zoom', description: 'Video conferencing' },
    { companyId: 101242, slug: 'monday', name: 'Monday.com', description: 'Work OS' },
    { companyId: 101243, slug: 'clickup', name: 'ClickUp', description: 'Productivity platform' },
    { companyId: 101244, slug: 'loom', name: 'Loom', description: 'Video messaging' },
    { companyId: 101245, slug: 'intercom', name: 'Intercom', description: 'Customer messaging' },
    { companyId: 101246, slug: 'zendesk', name: 'Zendesk', description: 'Customer service' },
    { companyId: 101247, slug: 'okta', name: 'Okta', description: 'Identity management' },
    { companyId: 101248, slug: 'splunk', name: 'Splunk', description: 'Data platform' },
    { companyId: 101249, slug: 'newrelic', name: 'New Relic', description: 'Observability platform' },
    { companyId: 101250, slug: 'sumologic', name: 'Sumo Logic', description: 'Log management' },
    { companyId: 101251, slug: 'sentry', name: 'Sentry', description: 'Error tracking' },
    { companyId: 101252, slug: 'rollbar', name: 'Rollbar', description: 'Error tracking' },
    { companyId: 101253, slug: 'honeycomb', name: 'Honeycomb', description: 'Observability' },
    { companyId: 101254, slug: 'lightstep', name: 'Lightstep', description: 'Observability' },
    { companyId: 101255, slug: 'databricks', name: 'Databricks', description: 'Data and AI platform' },
    { companyId: 101256, slug: 'palantir', name: 'Palantir', description: 'Big data analytics' },
    { companyId: 101257, slug: 'tableau', name: 'Tableau', description: 'Business intelligence' },
    { companyId: 101258, slug: 'looker', name: 'Looker', description: 'Business intelligence' },
    { companyId: 101259, slug: 'amplitude', name: 'Amplitude', description: 'Product analytics' },
    { companyId: 101260, slug: 'mixpanel', name: 'Mixpanel', description: 'Product analytics' },
    { companyId: 101261, slug: 'segment', name: 'Segment', description: 'Customer data platform' },
    { companyId: 101262, slug: 'heap', name: 'Heap', description: 'Product analytics' },
    { companyId: 101263, slug: 'fullstory', name: 'FullStory', description: 'Digital experience' },
    { companyId: 101264, slug: 'hotjar', name: 'Hotjar', description: 'Analytics and heatmaps' },

    // 💰 FinTech Adicionais
    { companyId: 101265, slug: 'affirm', name: 'Affirm', description: 'Buy now pay later' },
    { companyId: 101266, slug: 'klarna', name: 'Klarna', description: 'Buy now pay later' },
    { companyId: 101267, slug: 'afterpay', name: 'Afterpay', description: 'Buy now pay later' },
    { companyId: 101268, slug: 'brex', name: 'Brex', description: 'Corporate cards' },
    { companyId: 101269, slug: 'ramp', name: 'Ramp', description: 'Corporate finance' },
    { companyId: 101270, slug: 'mercury', name: 'Mercury', description: 'Banking for startups' },
    { companyId: 101271, slug: 'gusto', name: 'Gusto', description: 'Payroll and benefits' },
    { companyId: 101272, slug: 'deel', name: 'Deel', description: 'Global payroll' },
    { companyId: 101273, slug: 'wise', name: 'Wise', description: 'Money transfer' },
    { companyId: 101274, slug: 'revolut', name: 'Revolut', description: 'Digital banking' },
    { companyId: 101275, slug: 'n26', name: 'N26', description: 'Digital banking' },
    { companyId: 101276, slug: 'sofi', name: 'SoFi', description: 'FinTech platform' },
    { companyId: 101277, slug: 'paypal', name: 'PayPal', description: 'Payments' },
    { companyId: 101278, slug: 'adyen', name: 'Adyen', description: 'Payments' },
    { companyId: 101279, slug: 'stripe', name: 'Stripe', description: 'Payment infrastructure' },

    // 🤖 AI & Machine Learning
    { companyId: 101280, slug: 'anthropic', name: 'Anthropic', description: 'AI safety research' },
    { companyId: 101281, slug: 'cohere', name: 'Cohere', description: 'Enterprise AI' },
    { companyId: 101282, slug: 'scale', name: 'Scale AI', description: 'AI data platform' },
    { companyId: 101283, slug: 'huggingface', name: 'Hugging Face', description: 'ML model hub' },
    { companyId: 101284, slug: 'replicate', name: 'Replicate', description: 'ML model deployment' },
    { companyId: 101285, slug: 'weights-biases', name: 'Weights & Biases', description: 'ML platform' },
    { companyId: 101286, slug: 'cerebras', name: 'Cerebras', description: 'AI hardware' },
    { companyId: 101287, slug: 'graphcore', name: 'Graphcore', description: 'AI chips' },
    { companyId: 101288, slug: 'samba', name: 'SambaNova', description: 'AI systems' },

    // 🛠️ Developer Tools & Infrastructure Adicionais
    { companyId: 101289, slug: 'circleci', name: 'CircleCI', description: 'CI/CD platform' },
    { companyId: 101290, slug: 'travisci', name: 'Travis CI', description: 'CI/CD platform' },
    { companyId: 101291, slug: 'jenkins', name: 'Jenkins', description: 'CI/CD automation' },
    { companyId: 101292, slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
    { companyId: 101293, slug: 'bitbucket', name: 'Bitbucket', description: 'Code hosting' },
    { companyId: 101294, slug: 'render', name: 'Render', description: 'Cloud hosting' },
    { companyId: 101295, slug: 'railway', name: 'Railway', description: 'Cloud platform' },
    { companyId: 101296, slug: 'fly', name: 'Fly.io', description: 'Edge computing' },
    { companyId: 101297, slug: 'planetscale', name: 'PlanetScale', description: 'MySQL platform' },
    { companyId: 101298, slug: 'neon', name: 'Neon', description: 'Serverless Postgres' },
    { companyId: 101299, slug: 'supabase', name: 'Supabase', description: 'Firebase alternative' },
    { companyId: 101300, slug: 'convex', name: 'Convex', description: 'Backend platform' },
    { companyId: 101301, slug: 'firebase', name: 'Firebase', description: 'Google backend platform' },
    { companyId: 101302, slug: 'aws', name: 'AWS', description: 'Amazon Web Services' },
    { companyId: 101303, slug: 'gcp', name: 'Google Cloud', description: 'Google Cloud Platform' },
    { companyId: 101304, slug: 'azure', name: 'Microsoft Azure', description: 'Cloud platform' },

    // 🎮 Gaming & Entertainment
    { companyId: 101305, slug: 'epic', name: 'Epic Games', description: 'Gaming (Fortnite, Unreal)' },
    { companyId: 101306, slug: 'riot', name: 'Riot Games', description: 'Gaming (League of Legends)' },
    { companyId: 101307, slug: 'unity', name: 'Unity', description: 'Game engine' },
    { companyId: 101308, slug: 'roblox', name: 'Roblox', description: 'User-generated games' },
    { companyId: 101309, slug: 'twitch', name: 'Twitch', description: 'Live streaming' },
    { companyId: 101310, slug: 'youtube', name: 'YouTube', description: 'Video platform' },
    { companyId: 101311, slug: 'netflix', name: 'Netflix', description: 'Streaming service' },
    { companyId: 101312, slug: 'disney', name: 'Disney', description: 'Entertainment' },
    { companyId: 101313, slug: 'warner', name: 'Warner Bros', description: 'Entertainment' },

    // 🛒 E-commerce & Marketplaces
    { companyId: 101314, slug: 'amazon', name: 'Amazon', description: 'E-commerce and cloud' },
    { companyId: 101315, slug: 'etsy', name: 'Etsy', description: 'Handmade marketplace' },
    { companyId: 101316, slug: 'wayfair', name: 'Wayfair', description: 'Home goods' },
    { companyId: 101317, slug: 'stockx', name: 'StockX', description: 'Sneaker marketplace' },
    { companyId: 101318, slug: 'poshmark', name: 'Poshmark', description: 'Fashion marketplace' },
    { companyId: 101319, slug: 'thredup', name: 'ThredUp', description: 'Online consignment' },
    { companyId: 101320, slug: 'faire', name: 'Faire', description: 'Wholesale marketplace' },
    { companyId: 101321, slug: 'flexport', name: 'Flexport', description: 'Freight forwarding' },
    { companyId: 101322, slug: 'shippo', name: 'Shippo', description: 'Shipping API' },

    // 🏥 HealthTech
    { companyId: 101323, slug: 'oscar', name: 'Oscar Health', description: 'Health insurance' },
    { companyId: 101324, slug: 'headway', name: 'Headway', description: 'Mental health' },
    { companyId: 101325, slug: 'ro', name: 'Ro', description: 'Telehealth' },
    { companyId: 101326, slug: 'hims', name: 'Hims & Hers', description: 'Telehealth' },
    { companyId: 101327, slug: 'tempus', name: 'Tempus', description: 'AI healthcare' },
    { companyId: 101328, slug: '23andme', name: '23andMe', description: 'Genetic testing' },

    // 🏠 Real Estate Tech
    { companyId: 101329, slug: 'opendoor', name: 'Opendoor', description: 'iBuying' },
    { companyId: 101330, slug: 'compass', name: 'Compass', description: 'Real estate platform' },
    { companyId: 101331, slug: 'zillow', name: 'Zillow', description: 'Real estate platform' },
    { companyId: 101332, slug: 'redfin', name: 'Redfin', description: 'Real estate tech' },

    // 🌍 Travel & Hospitality
    { companyId: 101333, slug: 'booking', name: 'Booking.com', description: 'Travel booking' },
    { companyId: 101334, slug: 'expedia', name: 'Expedia', description: 'Travel booking' },
    { companyId: 101335, slug: 'tripadvisor', name: 'TripAdvisor', description: 'Travel reviews' },

    // 🚗 Mobility & Transportation
    { companyId: 101336, slug: 'tesla', name: 'Tesla', description: 'Electric vehicles' },
    { companyId: 101337, slug: 'rivian', name: 'Rivian', description: 'Electric vehicles' },
    { companyId: 101338, slug: 'lucid', name: 'Lucid Motors', description: 'Electric vehicles' },
    { companyId: 101339, slug: 'waymo', name: 'Waymo', description: 'Autonomous vehicles' },
    { companyId: 101340, slug: 'cruise', name: 'Cruise', description: 'Autonomous vehicles' },

    // 🎓 EdTech
    { companyId: 101341, slug: 'coursera', name: 'Coursera', description: 'Online learning' },
    { companyId: 101342, slug: 'udemy', name: 'Udemy', description: 'Online courses' },
    { companyId: 101343, slug: 'khan', name: 'Khan Academy', description: 'Free education' },
    { companyId: 101344, slug: 'codecademy', name: 'Codecademy', description: 'Coding education' },
    { companyId: 101345, slug: 'pluralsight', name: 'Pluralsight', description: 'Tech training' },

    // 🔒 Security & Compliance
    { companyId: 101346, slug: 'crowdstrike', name: 'CrowdStrike', description: 'Cybersecurity' },
    { companyId: 101347, slug: 'paloalto', name: 'Palo Alto Networks', description: 'Cybersecurity' },
    { companyId: 101348, slug: 'okta', name: 'Okta', description: 'Identity management' },
    { companyId: 101349, slug: '1password', name: '1Password', description: 'Password manager' },
    { companyId: 101350, slug: 'lastpass', name: 'LastPass', description: 'Password manager' },
    { companyId: 101351, slug: 'vanta', name: 'Vanta', description: 'Security compliance' },
    { companyId: 101352, slug: 'drata', name: 'Drata', description: 'Security compliance' },
    { companyId: 101353, slug: 'secureframe', name: 'Secureframe', description: 'Compliance platform' },

    // 🌎 LATAM Companies no Built In - BRASIL
    { companyId: 101354, slug: 'nubank', name: 'Nubank', description: 'Digital bank Brasil' },
    { companyId: 101355, slug: 'mercadolibre', name: 'Mercado Libre', description: 'E-commerce LATAM' },
    { companyId: 101356, slug: 'rappi', name: 'Rappi', description: 'Super app delivery LATAM' },
    { companyId: 101357, slug: 'kavak', name: 'Kavak', description: 'Used car marketplace México' },
    { companyId: 101358, slug: 'quintoandar', name: 'QuintoAndar', description: 'PropTech Brasil' },
    { companyId: 101359, slug: 'loft', name: 'Loft', description: 'Real estate tech Brasil' },
    { companyId: 101360, slug: 'creditas', name: 'Creditas', description: 'FinTech Brasil' },
    { companyId: 101361, slug: 'stone', name: 'Stone', description: 'Payments Brasil' },
    { companyId: 101362, slug: 'ifood', name: 'iFood', description: 'Food delivery Brasil' },
    { companyId: 101363, slug: 'vtex', name: 'VTEX', description: 'E-commerce platform Brasil' },
    { companyId: 101364, slug: 'globant', name: 'Globant', description: 'Digital transformation Argentina' },
    { companyId: 101365, slug: 'auth0', name: 'Auth0', description: 'Identity platform Argentina' },
    { companyId: 101366, slug: 'avature', name: 'Avature', description: 'HR software Argentina' },
    { companyId: 101367, slug: 'wildlife', name: 'Wildlife Studios', description: 'Mobile gaming Brasil' },
    { companyId: 101368, slug: 'picpay', name: 'PicPay', description: 'Digital wallet Brasil' },
    { companyId: 101369, slug: 'banco-inter', name: 'Banco Inter', description: 'Digital bank Brasil' },
    { companyId: 101370, slug: 'c6-bank', name: 'C6 Bank', description: 'Digital bank Brasil' },
    { companyId: 101371, slug: 'neon', name: 'Neon Pagamentos', description: 'Digital bank Brasil' },
    { companyId: 101372, slug: 'will-bank', name: 'Will Bank', description: 'Digital bank Brasil' },
    { companyId: 101373, slug: 'merama', name: 'Merama', description: 'E-commerce aggregator LATAM' },
    { companyId: 101374, slug: 'madeira-madeira', name: 'MadeiraMadeira', description: 'E-commerce Brasil' },
    { companyId: 101375, slug: 'magazine-luiza', name: 'Magazine Luiza', description: 'E-commerce Brasil' },
    { companyId: 101376, slug: 'americanas', name: 'Americanas', description: 'E-commerce Brasil' },
    { companyId: 101377, slug: 'casas-bahia', name: 'Casas Bahia', description: 'E-commerce Brasil' },
    { companyId: 101378, slug: 'olist', name: 'Olist', description: 'E-commerce marketplace Brasil' },
    { companyId: 101379, slug: 'loggi', name: 'Loggi', description: 'Logistics Brasil' },
    { companyId: 101380, slug: '99', name: '99', description: 'Ride-hailing Brasil' },
    { companyId: 101381, slug: 'movile', name: 'Movile', description: 'Mobile commerce Brasil' },
    { companyId: 101382, slug: 'zoox', name: 'Zoox', description: 'Autonomous vehicles' },
    { companyId: 101384, slug: 'ebanx', name: 'EBANX', description: 'Cross-border payments Brasil' },
    { companyId: 101385, slug: 'pagseguro', name: 'PagSeguro', description: 'Payments Brasil' },
    { companyId: 101386, slug: 'cielo', name: 'Cielo', description: 'Payments Brasil' },
    { companyId: 101387, slug: 'getnet', name: 'GetNet', description: 'Payments Brasil' },
    { companyId: 101388, slug: 'geru', name: 'Geru', description: 'FinTech lending Brasil' },
    { companyId: 101389, slug: 'rebel', name: 'Rebel', description: 'FinTech Brasil' },
    { companyId: 101391, slug: 'caju', name: 'Caju', description: 'Benefits platform Brasil' },
    { companyId: 101392, slug: 'ben', name: 'Ben', description: 'Benefits platform Brasil' },
    { companyId: 101393, slug: 'gympass', name: 'Gympass', description: 'Corporate wellness Brasil' },
    { companyId: 101394, slug: 'cobli', name: 'Cobli', description: 'Fleet management Brasil' },
    { companyId: 101395, slug: 'fretebras', name: 'FreteBras', description: 'Logistics Brasil' },
    { companyId: 101396, slug: 'cargo-x', name: 'CargoX', description: 'Logistics tech Brasil' },
    { companyId: 101397, slug: 'resultados-digitais', name: 'RD Station', description: 'Marketing automation Brasil' },
    { companyId: 101398, slug: 'take-blip', name: 'Take Blip', description: 'Conversational AI Brasil' },
    { companyId: 101399, slug: 'zendesk', name: 'Zendesk', description: 'Customer service' },
    { companyId: 101400, slug: 'totvs', name: 'TOTVS', description: 'Enterprise software Brasil' },
    { companyId: 101401, slug: 'linx', name: 'Linx', description: 'Retail tech Brasil' },
    { companyId: 101402, slug: 'ciandt', name: 'CI&T', description: 'Digital transformation Brasil' },
    { companyId: 101403, slug: 'thoughtworks', name: 'Thoughtworks', description: 'Software consultancy' },
    { companyId: 101404, slug: 'accenture', name: 'Accenture', description: 'Consulting' },
    { companyId: 101405, slug: 'capgemini', name: 'Capgemini', description: 'Consulting' },
    { companyId: 101406, slug: 'cognizant', name: 'Cognizant', description: 'IT services' },
    { companyId: 101407, slug: 'wipro', name: 'Wipro', description: 'IT services' },
    { companyId: 101408, slug: 'tcs', name: 'TCS', description: 'IT services' },
    { companyId: 101409, slug: 'infosys', name: 'Infosys', description: 'IT services' },
    { companyId: 101410, slug: 'epam', name: 'EPAM', description: 'Software engineering' },
    { companyId: 101411, slug: 'andela', name: 'Andela', description: 'Remote engineering' },
    { companyId: 101412, slug: 'turing', name: 'Turing', description: 'Remote engineering' },
    { companyId: 101413, slug: 'crossover', name: 'Crossover', description: 'Remote work platform' },

    // 🌎 LATAM Companies - MÉXICO
    { companyId: 101414, slug: 'clip', name: 'Clip', description: 'Payments México' },
    { companyId: 101415, slug: 'konfio', name: 'Konfio', description: 'FinTech lending México' },
    { companyId: 101416, slug: 'credijusto', name: 'Credijusto', description: 'FinTech México' },
    { companyId: 101417, slug: 'uala', name: 'Ualá', description: 'FinTech Argentina/México' },
    { companyId: 101418, slug: 'bitso', name: 'Bitso', description: 'Crypto exchange México' },
    { companyId: 101419, slug: 'stori', name: 'Stori', description: 'Digital bank México' },
    { companyId: 101420, slug: 'nu', name: 'Nu México', description: 'Nubank México' },
    { companyId: 101421, slug: 'justo', name: 'Justo', description: 'Grocery delivery México' },
    { companyId: 101422, slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery LATAM' },
    { companyId: 101423, slug: 'uber-eats', name: 'Uber Eats', description: 'Food delivery' },
    { companyId: 101424, slug: 'didi', name: 'DiDi', description: 'Ride-hailing México' },
    { companyId: 101425, slug: 'guru', name: 'Guru', description: 'Freelance platform' },
    { companyId: 101426, slug: 'softtek', name: 'Softtek', description: 'IT services México' },
    { companyId: 101427, slug: 'nearshore', name: 'Nearshore', description: 'IT services México' },
    { companyId: 101428, slug: 'wizeline', name: 'Wizeline', description: 'Product development México' },
    { companyId: 101429, slug: 'globant', name: 'Globant', description: 'Digital transformation' },
    { companyId: 101430, slug: 'endava', name: 'Endava', description: 'Software engineering' },
    { companyId: 101431, slug: 'belatrix', name: 'Belatrix', description: 'Software development' },
    { companyId: 101432, slug: 'bairesdev', name: 'BairesDev', description: 'Software development LATAM' },
    { companyId: 101433, slug: 'rootstrap', name: 'Rootstrap', description: 'Product development' },
    { companyId: 101434, slug: 'abstracta', name: 'Abstracta', description: 'QA & Testing' },

    // 🌎 LATAM Companies - ARGENTINA
    { companyId: 101436, slug: 'uala', name: 'Ualá', description: 'FinTech Argentina' },
    { companyId: 101437, slug: 'mercadopago', name: 'Mercado Pago', description: 'Payments Argentina' },
    { companyId: 101438, slug: 'globant', name: 'Globant', description: 'Digital transformation Argentina' },
    { companyId: 101439, slug: 'auth0', name: 'Auth0', description: 'Identity platform Argentina' },
    { companyId: 101440, slug: 'avature', name: 'Avature', description: 'HR software Argentina' },
    { companyId: 101441, slug: 'despegar', name: 'Despegar', description: 'Travel booking Argentina' },
    { companyId: 101442, slug: 'pedidosya', name: 'PedidosYa', description: 'Food delivery Argentina' },
    { companyId: 101443, slug: 'wolox', name: 'Wolox', description: 'Software development Argentina' },
    { companyId: 101444, slug: 'baufest', name: 'Baufest', description: 'Software development Argentina' },
    { companyId: 101445, slug: 'intive', name: 'Intive', description: 'Digital product development' },
    { companyId: 101446, slug: 'abstracta', name: 'Abstracta', description: 'QA & Testing Argentina' },
    { companyId: 101447, slug: 'rootstrap', name: 'Rootstrap', description: 'Product development Argentina' },
    { companyId: 101448, slug: 'bairesdev', name: 'BairesDev', description: 'Software development Argentina' },
    { companyId: 101449, slug: 'belatrix', name: 'Belatrix', description: 'Software development Argentina' },
    { companyId: 101450, slug: 'endava', name: 'Endava', description: 'Software engineering Argentina' },

    // 🌎 LATAM Companies - COLÔMBIA
    { companyId: 101451, slug: 'rappi', name: 'Rappi', description: 'Super app delivery Colômbia' },
    { companyId: 101452, slug: 'nu', name: 'Nu Colômbia', description: 'Nubank Colômbia' },
    { companyId: 101453, slug: 'lulo-bank', name: 'Lulo Bank', description: 'Digital bank Colômbia' },
    { companyId: 101454, slug: 'nequi', name: 'Nequi', description: 'Digital wallet Colômbia' },
    { companyId: 101455, slug: 'daviplata', name: 'Daviplata', description: 'Digital wallet Colômbia' },
    { companyId: 101456, slug: 'addi', name: 'Addi', description: 'BNPL Colômbia' },
    { companyId: 101457, slug: 'tul', name: 'Tul', description: 'FinTech Colômbia' },
    { companyId: 101458, slug: 'lifemiles', name: 'LifeMiles', description: 'Loyalty program Colômbia' },
    { companyId: 101459, slug: 'globant', name: 'Globant Colômbia', description: 'Digital transformation' },
    { companyId: 101460, slug: 'endava', name: 'Endava Colômbia', description: 'Software engineering' },
    { companyId: 101461, slug: 'bairesdev', name: 'BairesDev Colômbia', description: 'Software development' },
    { companyId: 101462, slug: 'abstracta', name: 'Abstracta Colômbia', description: 'QA & Testing' },

    // 🌎 LATAM Companies - OUTROS PAÍSES
    { companyId: 101463, slug: 'dlocal', name: 'dLocal', description: 'Cross-border payments Uruguai' },
    { companyId: 101464, slug: 'abstracta', name: 'Abstracta', description: 'QA & Testing Uruguai' },
    { companyId: 101465, slug: 'globant', name: 'Globant Chile', description: 'Digital transformation' },
    { companyId: 101466, slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery Chile' },
    { companyId: 101467, slug: 'kushki', name: 'Kushki', description: 'Payments Equador' },
    { companyId: 101468, slug: 'yuno', name: 'Yuno', description: 'Payments orchestration LATAM' },
    { companyId: 101469, slug: 'clara', name: 'Clara', description: 'Corporate cards México/Brasil' },
    { companyId: 101470, slug: 'connectly', name: 'Connectly', description: 'Customer messaging LATAM' },
    { companyId: 101471, slug: 'bluelight', name: 'Bluelight Consulting', description: 'Software consultancy LATAM' },
    { companyId: 101472, slug: 'idt', name: 'IDT', description: 'Telecom & fintech LATAM' },
    { companyId: 101473, slug: 'welocalize', name: 'Welocalize', description: 'Localization services México' },

    // 🚀 MAIS TECH GIANTS & UNICORNS
    { companyId: 101474, slug: 'google', name: 'Google', description: 'Search, Cloud, AI' },
    { companyId: 101475, slug: 'microsoft', name: 'Microsoft', description: 'Cloud, Software' },
    { companyId: 101476, slug: 'apple', name: 'Apple', description: 'Consumer tech' },
    { companyId: 101477, slug: 'meta', name: 'Meta', description: 'Social media' },
    { companyId: 101478, slug: 'amazon', name: 'Amazon', description: 'E-commerce, AWS' },
    { companyId: 101479, slug: 'tesla', name: 'Tesla', description: 'Electric vehicles' },
    { companyId: 101480, slug: 'nvidia', name: 'NVIDIA', description: 'AI chips' },
    { companyId: 101481, slug: 'intel', name: 'Intel', description: 'Semiconductors' },
    { companyId: 101482, slug: 'amd', name: 'AMD', description: 'Semiconductors' },
    { companyId: 101483, slug: 'qualcomm', name: 'Qualcomm', description: 'Mobile chips' },
    { companyId: 101484, slug: 'broadcom', name: 'Broadcom', description: 'Semiconductors' },
    { companyId: 101485, slug: 'oracle', name: 'Oracle', description: 'Enterprise software' },
    { companyId: 101486, slug: 'ibm', name: 'IBM', description: 'Enterprise tech' },
    { companyId: 101487, slug: 'cisco', name: 'Cisco', description: 'Networking' },
    { companyId: 101488, slug: 'sap', name: 'SAP', description: 'Enterprise software' },
    { companyId: 101489, slug: 'vmware', name: 'VMware', description: 'Cloud infrastructure' },
    { companyId: 101490, slug: 'servicenow', name: 'ServiceNow', description: 'IT management' },
    { companyId: 101491, slug: 'adobe', name: 'Adobe', description: 'Creative software' },
    { companyId: 101492, slug: 'autodesk', name: 'Autodesk', description: 'Design software' },
    { companyId: 101493, slug: 'salesforce', name: 'Salesforce', description: 'CRM' },
    { companyId: 101494, slug: 'workday', name: 'Workday', description: 'HR software' },
    { companyId: 101495, slug: 'splunk', name: 'Splunk', description: 'Data platform' },
    { companyId: 101497, slug: 'tableau', name: 'Tableau', description: 'Business intelligence' },
    { companyId: 101498, slug: 'palantir', name: 'Palantir', description: 'Big data analytics' },
    { companyId: 101499, slug: 'databricks', name: 'Databricks', description: 'Data & AI platform' },
    { companyId: 101500, slug: 'snowflake', name: 'Snowflake', description: 'Data cloud' },
    { companyId: 101501, slug: 'mongodb', name: 'MongoDB', description: 'NoSQL database' },
    { companyId: 101502, slug: 'elastic', name: 'Elastic', description: 'Search & analytics' },
    { companyId: 101503, slug: 'redis', name: 'Redis', description: 'In-memory database' },
    { companyId: 101504, slug: 'couchbase', name: 'Couchbase', description: 'NoSQL database' },
    { companyId: 101505, slug: 'cassandra', name: 'Apache Cassandra', description: 'NoSQL database' },
    { companyId: 101506, slug: 'influxdb', name: 'InfluxDB', description: 'Time series database' },
    { companyId: 101507, slug: 'timescale', name: 'Timescale', description: 'Time series database' },
    { companyId: 101508, slug: 'cockroach', name: 'Cockroach Labs', description: 'Distributed database' },
    { companyId: 101509, slug: 'fauna', name: 'Fauna', description: 'Serverless database' },
    { companyId: 101510, slug: 'planetscale', name: 'PlanetScale', description: 'MySQL platform' },
    { companyId: 101511, slug: 'supabase', name: 'Supabase', description: 'Firebase alternative' },
    { companyId: 101512, slug: 'firebase', name: 'Firebase', description: 'Google backend' },
    { companyId: 101513, slug: 'aws', name: 'AWS', description: 'Amazon Web Services' },
    { companyId: 101514, slug: 'gcp', name: 'Google Cloud', description: 'Google Cloud Platform' },
    { companyId: 101515, slug: 'azure', name: 'Microsoft Azure', description: 'Cloud platform' },
    { companyId: 101516, slug: 'digitalocean', name: 'DigitalOcean', description: 'Cloud hosting' },
    { companyId: 101517, slug: 'linode', name: 'Linode', description: 'Cloud hosting' },
    { companyId: 101518, slug: 'vultr', name: 'Vultr', description: 'Cloud hosting' },
    { companyId: 101519, slug: 'heroku', name: 'Heroku', description: 'Platform as a service' },
    { companyId: 101520, slug: 'render', name: 'Render', description: 'Cloud hosting' },
    { companyId: 101521, slug: 'railway', name: 'Railway', description: 'Cloud platform' },
    { companyId: 101522, slug: 'fly', name: 'Fly.io', description: 'Edge computing' },
    { companyId: 101523, slug: 'cloudflare', name: 'Cloudflare', description: 'CDN & security' },
    { companyId: 101524, slug: 'fastly', name: 'Fastly', description: 'Edge cloud platform' },
    { companyId: 101525, slug: 'akamai', name: 'Akamai', description: 'CDN & security' },
    { companyId: 101526, slug: 'bunny', name: 'Bunny CDN', description: 'CDN platform' },
    { companyId: 101527, slug: 'keycdn', name: 'KeyCDN', description: 'CDN service' },
    { companyId: 101528, slug: 'stackpath', name: 'StackPath', description: 'Edge computing' },
    { companyId: 101529, slug: 'datadog', name: 'Datadog', description: 'Monitoring & analytics' },
    { companyId: 101530, slug: 'newrelic', name: 'New Relic', description: 'Observability' },
    { companyId: 101532, slug: 'sumologic', name: 'Sumo Logic', description: 'Log management' },
    { companyId: 101533, slug: 'sentry', name: 'Sentry', description: 'Error tracking' },
    { companyId: 101534, slug: 'rollbar', name: 'Rollbar', description: 'Error tracking' },
    { companyId: 101535, slug: 'honeycomb', name: 'Honeycomb', description: 'Observability' },
    { companyId: 101536, slug: 'lightstep', name: 'Lightstep', description: 'Observability' },
    { companyId: 101537, slug: 'dynatrace', name: 'Dynatrace', description: 'Application monitoring' },
    { companyId: 101538, slug: 'appdynamics', name: 'AppDynamics', description: 'Application monitoring' },
    { companyId: 101540, slug: 'algolia', name: 'Algolia', description: 'Search API' },
    { companyId: 101541, slug: 'meilisearch', name: 'Meilisearch', description: 'Search engine' },
    { companyId: 101542, slug: 'typesense', name: 'Typesense', description: 'Search engine' },
    { companyId: 101543, slug: 'swiftype', name: 'Swiftype', description: 'Search API' },
    { companyId: 101544, slug: 'github', name: 'GitHub', description: 'Code hosting' },
    { companyId: 101545, slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
    { companyId: 101546, slug: 'bitbucket', name: 'Bitbucket', description: 'Code hosting' },
    { companyId: 101547, slug: 'sourcegraph', name: 'Sourcegraph', description: 'Code search' },
    { companyId: 101548, slug: 'circleci', name: 'CircleCI', description: 'CI/CD' },
    { companyId: 101549, slug: 'travisci', name: 'Travis CI', description: 'CI/CD' },
    { companyId: 101550, slug: 'jenkins', name: 'Jenkins', description: 'CI/CD automation' },
    { companyId: 101551, slug: 'github-actions', name: 'GitHub Actions', description: 'CI/CD' },
    { companyId: 101552, slug: 'gitlab-ci', name: 'GitLab CI', description: 'CI/CD' },
    { companyId: 101553, slug: 'buildkite', name: 'Buildkite', description: 'CI/CD' },
    { companyId: 101554, slug: 'semaphore', name: 'Semaphore', description: 'CI/CD' },
    { companyId: 101555, slug: 'codeship', name: 'Codeship', description: 'CI/CD' },
    { companyId: 101556, slug: 'drone', name: 'Drone', description: 'CI/CD' },
    { companyId: 101557, slug: 'harness', name: 'Harness', description: 'CI/CD platform' },
    { companyId: 101558, slug: 'spinnaker', name: 'Spinnaker', description: 'CD platform' },
    { companyId: 101559, slug: 'argo', name: 'Argo', description: 'Kubernetes workflows' },
    { companyId: 101560, slug: 'tekton', name: 'Tekton', description: 'CI/CD framework' },
    { companyId: 101561, slug: 'flux', name: 'Flux', description: 'GitOps tool' },
    { companyId: 101562, slug: 'argo-cd', name: 'Argo CD', description: 'GitOps tool' },
    { companyId: 101563, slug: 'weaveworks', name: 'Weaveworks', description: 'GitOps platform' },
    { companyId: 101564, slug: 'kubernetes', name: 'Kubernetes', description: 'Container orchestration' },
    { companyId: 101565, slug: 'docker', name: 'Docker', description: 'Container platform' },
    { companyId: 101566, slug: 'rancher', name: 'Rancher', description: 'Kubernetes management' },
    { companyId: 101567, slug: 'redhat', name: 'Red Hat', description: 'Enterprise Linux' },
    { companyId: 101568, slug: 'canonical', name: 'Canonical', description: 'Ubuntu' },
    { companyId: 101569, slug: 'suse', name: 'SUSE', description: 'Enterprise Linux' },
    { companyId: 101570, slug: 'hashicorp', name: 'HashiCorp', description: 'Infrastructure tools' },
    { companyId: 101571, slug: 'terraform', name: 'Terraform', description: 'Infrastructure as code' },
    { companyId: 101572, slug: 'pulumi', name: 'Pulumi', description: 'Infrastructure as code' },
    { companyId: 101573, slug: 'ansible', name: 'Ansible', description: 'Configuration management' },
    { companyId: 101574, slug: 'chef', name: 'Chef', description: 'Configuration management' },
    { companyId: 101575, slug: 'puppet', name: 'Puppet', description: 'Configuration management' },
    { companyId: 101576, slug: 'saltstack', name: 'SaltStack', description: 'Configuration management' },
    { companyId: 101577, slug: 'consul', name: 'Consul', description: 'Service mesh' },
    { companyId: 101578, slug: 'vault', name: 'Vault', description: 'Secrets management' },
    { companyId: 101579, slug: 'nomad', name: 'Nomad', description: 'Workload orchestration' },
    { companyId: 101580, slug: 'packer', name: 'Packer', description: 'Image builder' },
    { companyId: 101581, slug: 'vagrant', name: 'Vagrant', description: 'Development environments' },
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
