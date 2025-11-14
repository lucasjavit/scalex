import axios from 'axios';

/**
 * Script para descobrir empresas do Ashby testando a API
 * 
 * O Ashby não tem uma API pública que liste todas as empresas,
 * então testamos empresas conhecidas para verificar se existem.
 * 
 * API Pattern: https://api.ashbyhq.com/posting-api/job-board/{company}
 */

interface AshbyCompanyCandidate {
  slug: string;
  name: string;
  description?: string;
}

/**
 * Lista expandida de empresas conhecidas que podem usar Ashby
 * Baseada em pesquisas e listas públicas
 */
const ASHBY_COMPANY_CANDIDATES: AshbyCompanyCandidate[] = [
  // Empresas já verificadas (do seed atual)
  { slug: 'Neon', name: 'Neon', description: 'Payments and e-commerce platform' },
  { slug: 'Census', name: 'Census', description: 'Data activation platform' },
  { slug: 'Ramp', name: 'Ramp', description: 'Corporate card and spend management' },
  { slug: 'Deel', name: 'Deel', description: 'Global payroll and compliance' },
  { slug: 'Modal', name: 'Modal', description: 'Cloud infrastructure' },
  { slug: 'Ashby', name: 'Ashby', description: 'Recruiting software' },
  { slug: 'Mercury', name: 'Mercury', description: 'Banking for startups' },
  { slug: 'Middesk', name: 'Middesk', description: 'Business identity' },
  { slug: 'Supabase', name: 'Supabase', description: 'Open source Firebase alternative' },
  { slug: 'Vanta', name: 'Vanta', description: 'Security compliance automation' },
  { slug: 'Scale', name: 'Scale AI', description: 'AI data platform' },
  { slug: 'Anthropic', name: 'Anthropic', description: 'AI safety research' },
  { slug: 'Weights-Biases', name: 'Weights & Biases', description: 'ML platform' },
  { slug: 'Cohere', name: 'Cohere', description: 'Enterprise AI' },
  { slug: 'Harvey', name: 'Harvey', description: 'Generative AI for law' },
  { slug: 'Brex', name: 'Brex', description: 'Corporate cards' },
  { slug: 'Plaid', name: 'Plaid', description: 'Financial data APIs' },
  { slug: 'Stripe', name: 'Stripe', description: 'Payment infrastructure' },
  { slug: 'Gusto', name: 'Gusto', description: 'Payroll and benefits' },
  { slug: 'Modern-Treasury', name: 'Modern Treasury', description: 'Payment operations' },
  { slug: 'Vercel', name: 'Vercel', description: 'Frontend cloud' },
  { slug: 'Retool', name: 'Retool', description: 'Internal tools builder' },
  { slug: 'Render', name: 'Render', description: 'Cloud hosting' },
  { slug: 'Fly', name: 'Fly.io', description: 'App deployment platform' },
  { slug: 'WorkOS', name: 'WorkOS', description: 'Enterprise-ready features' },

  // Lista expandida do TODAS_EMPRESAS_CONSOLIDADAS.md
  { slug: 'truelogic', name: 'Truelogic', description: 'Staff augmentation LATAM' },
  { slug: 'agent', name: 'Agent', description: 'Construction tech LATAM' },
  { slug: 'nango', name: 'Nango', description: 'Open-source dev tools' },
  { slug: 'rutter', name: 'Rutter', description: 'Data integration' },
  { slug: 'elevenlabs', name: 'ElevenLabs', description: 'AI voice synthesis' },
  { slug: 'notion', name: 'Notion', description: 'All-in-one workspace' },
  { slug: 'linear', name: 'Linear', description: 'Issue tracking' },
  { slug: 'replit', name: 'Replit', description: 'Online IDE' },
  { slug: 'posthog', name: 'PostHog', description: 'Product analytics' },
  { slug: 'clay', name: 'Clay', description: 'Sales automation' },
  { slug: 'wander', name: 'Wander', description: 'Travel concierge' },
  { slug: 'whatnot', name: 'Whatnot', description: 'Live shopping' },
  { slug: 'roompricegenie', name: 'RoomPriceGenie', description: 'Hotel pricing AI' },
  { slug: 'shopify', name: 'Shopify', description: 'E-commerce platform' },
  { slug: 'snowflake', name: 'Snowflake', description: 'Data cloud' },
  { slug: 'reddit', name: 'Reddit', description: 'Social network' },
  { slug: 'duolingo', name: 'Duolingo', description: 'Language learning' },
  { slug: 'uipath', name: 'UiPath', description: 'RPA automation' },
  { slug: 'zapier', name: 'Zapier', description: 'Automation platform' },
  { slug: 'deliveroo', name: 'Deliveroo', description: 'Food delivery' },
  { slug: 'lime', name: 'Lime', description: 'Micromobility' },
  { slug: 'lemonade', name: 'Lemonade', description: 'Insurance tech' },
  { slug: 'gorgias', name: 'Gorgias', description: 'Customer support' },
  { slug: 'ironclad', name: 'Ironclad', description: 'Contract management' },
  { slug: 'fullstory', name: 'FullStory', description: 'Digital experience' },
  { slug: 'marqeta', name: 'Marqeta', description: 'Card issuing' },
  { slug: 'dave', name: 'Dave', description: 'Neobank' },
  { slug: 'multiverse', name: 'Multiverse', description: 'EdTech apprenticeships' },
  { slug: 'flock-safety', name: 'Flock Safety', description: 'Public safety tech' },
  { slug: 'form-energy', name: 'Form Energy', description: 'Energy storage' },
  { slug: 'aurora-solar', name: 'Aurora Solar', description: 'Solar design software' },
  { slug: 'eightsleep', name: 'EightSleep', description: 'Sleep tech' },
  { slug: 'hackerone', name: 'HackerOne', description: 'Bug bounty platform' },
  { slug: 'brightline', name: 'Brightline', description: 'Mental health kids' },
  { slug: 'monte-carlo', name: 'Monte Carlo', description: 'Data observability' },
  { slug: 'coder', name: 'Coder', description: 'Cloud development' },
  { slug: 'boomi', name: 'Boomi', description: 'Integration platform' },
  { slug: 'netgear', name: 'NETGEAR', description: 'Networking hardware' },
  { slug: 'column', name: 'Column', description: 'Developer bank' },
  { slug: 'unit', name: 'Unit', description: 'Banking-as-a-service' },
  { slug: 'increase', name: 'Increase', description: 'Banking infrastructure' },
  { slug: 'lithic', name: 'Lithic', description: 'Card issuing' },
  { slug: 'ledger', name: 'Ledger', description: 'Hardware wallets' },
  { slug: 'anchorage', name: 'Anchorage', description: 'Digital asset custody' },
  { slug: 'fireblocks', name: 'Fireblocks', description: 'Digital asset platform' },
  { slug: 'trmlabs', name: 'TRM Labs', description: 'Blockchain intelligence' },
  { slug: 'railway', name: 'Railway', description: 'Cloud platform' },
  { slug: 'planetscale', name: 'PlanetScale', description: 'MySQL platform' },
  { slug: 'convex', name: 'Convex', description: 'Backend platform' },
  { slug: 'valtown', name: 'Val Town', description: 'Code snippets' },
  { slug: 'mintlify', name: 'Mintlify', description: 'Documentation' },
  { slug: 'readme', name: 'ReadMe', description: 'API documentation' },
  { slug: 'character', name: 'Character.AI', description: 'AI characters' },
  { slug: 'cognition', name: 'Cognition Labs', description: 'Devin AI' },
  { slug: 'perplexity', name: 'Perplexity', description: 'AI search' },
  { slug: 'glean', name: 'Glean', description: 'Work search' },
  { slug: 'scaleai', name: 'Scale AI', description: 'AI data platform' },
  { slug: 'wandb', name: 'Weights & Biases', description: 'ML platform' },
  { slug: 'huggingface', name: 'Hugging Face', description: 'Model hub' },
  { slug: 'replicate', name: 'Replicate', description: 'Model deployment' },
  { slug: 'langchain', name: 'LangChain', description: 'LLM framework' },
  { slug: 'together', name: 'Together AI', description: 'Open model cloud' },
  { slug: 'drata', name: 'Drata', description: 'Security compliance' },
  { slug: 'secureframe', name: 'Secureframe', description: 'Compliance platform' },
  { slug: 'attio', name: 'Attio', description: 'Modern CRM' },
  { slug: 'folk', name: 'Folk', description: 'Relationship CRM' },
  { slug: 'sequoia', name: 'Sequoia', description: 'Venture capital' },

  // 🌎 EMPRESAS LATAM - América Latina
  // Brasil
  { slug: 'nubank', name: 'Nubank', description: 'Digital bank Brasil' },
  { slug: 'quintoandar', name: 'QuintoAndar', description: 'PropTech Brasil' },
  { slug: 'loft', name: 'Loft', description: 'Real estate tech Brasil' },
  { slug: 'creditas', name: 'Creditas', description: 'FinTech Brasil' },
  { slug: 'stone', name: 'Stone', description: 'Payments Brasil' },
  { slug: 'ifood', name: 'iFood', description: 'Food delivery Brasil' },
  { slug: 'vtex', name: 'VTEX', description: 'E-commerce platform Brasil' },
  { slug: 'olist', name: 'Olist', description: 'E-commerce solutions Brasil' },
  { slug: 'nuvemshop', name: 'Nuvemshop', description: 'E-commerce platform Brasil/Argentina' },
  { slug: 'magazineluiza', name: 'Magazine Luiza', description: 'Retail tech Brasil' },
  { slug: 'wildlifestudios', name: 'Wildlife Studios', description: 'Mobile gaming Brasil' },
  { slug: 'loggi', name: 'Loggi', description: 'Logistics Brasil' },
  { slug: 'gympass', name: 'Gympass', description: 'Corporate wellness Brasil' },
  { slug: 'pagseguro', name: 'PagSeguro', description: 'Payments Brasil' },
  { slug: 'picpay', name: 'PicPay', description: 'Digital wallet Brasil' },
  { slug: 'bancointer', name: 'Banco Inter', description: 'Digital bank Brasil' },
  { slug: 'c6bank', name: 'C6 Bank', description: 'Digital bank Brasil' },
  { slug: 'neon', name: 'Neon', description: 'Payments Brasil (já na lista, mas confirmando)' },
  { slug: 'bairesdev', name: 'BairesDev', description: 'Software outsourcing LATAM' },
  { slug: 'globant', name: 'Globant', description: 'Digital transformation Argentina' },

  // México
  { slug: 'kavak', name: 'Kavak', description: 'Used car marketplace México' },
  { slug: 'clip', name: 'Clip', description: 'Payments México' },
  { slug: 'konfio', name: 'Konfio', description: 'FinTech México' },
  { slug: 'rappi', name: 'Rappi', description: 'Super app delivery Colômbia/México' },
  { slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery Chile/México' },
  { slug: 'merama', name: 'Merama', description: 'E-commerce aggregator México' },
  { slug: 'clara', name: 'Clara', description: 'FinTech México' },
  { slug: 'stori', name: 'Stori', description: 'Credit card México' },
  { slug: 'uala', name: 'Ualá', description: 'FinTech Argentina/México' },

  // Argentina
  { slug: 'mercadolibre', name: 'Mercado Libre', description: 'E-commerce líder LATAM' },
  { slug: 'despegar', name: 'Despegar', description: 'Travel tech Argentina' },
  { slug: 'auth0', name: 'Auth0', description: 'Identity platform Argentina' },
  { slug: 'avature', name: 'Avature', description: 'HR software Argentina' },
  { slug: 'southworks', name: 'SOUTHWORKS', description: 'Software development Argentina' },
  { slug: 'proppel', name: 'Proppel', description: 'Top 1% talent LATAM' },
  { slug: 'nearsure', name: 'Nearsure', description: 'Staff augmentation LATAM' },
  { slug: 'azumo', name: 'Azumo', description: 'Software development nearshore LATAM' },

  // Colômbia
  { slug: 'lulo', name: 'Lulo', description: 'Digital bank Colômbia' },
  { slug: 'nu', name: 'Nu Colombia', description: 'Nubank Colômbia' },
  { slug: 'addi', name: 'Addi', description: 'Buy now pay later Colômbia' },
  { slug: 'tul', name: 'Tul', description: 'FinTech Colômbia' },

  // Outras LATAM
  { slug: 'yuno', name: 'Yuno', description: 'Payments orchestration LATAM' },
  { slug: 'connectly', name: 'Connectly', description: 'Customer messaging Brasil/LATAM' },
  { slug: 'bluelight', name: 'Bluelight Consulting', description: 'Software consultancy LATAM' },
  { slug: 'bluelightconsulting', name: 'Bluelight Consulting', description: 'Software consultancy LATAM' },
  { slug: 'welocalize', name: 'Welocalize', description: 'Localization services México/LATAM' },

  // 🏢 CONSULTORIAS - América Latina
  // Brasil
  { slug: 'thoughtworks', name: 'Thoughtworks', description: 'Software consultancy Brasil' },
  { slug: 'ciandt', name: 'CI&T', description: 'Digital transformation Brasil' },
  { slug: 'accenture', name: 'Accenture', description: 'Consulting Brasil' },
  { slug: 'deloitte', name: 'Deloitte', description: 'Consulting Brasil' },
  { slug: 'pwc', name: 'PwC', description: 'Consulting Brasil' },
  { slug: 'kpmg', name: 'KPMG', description: 'Consulting Brasil' },
  { slug: 'ey', name: 'EY', description: 'Consulting Brasil' },
  { slug: 'machado', name: 'Machado Meyer', description: 'Law firm Brasil' },
  { slug: 'pinheiro', name: 'Pinheiro Neto', description: 'Law firm Brasil' },
  { slug: 'tcs', name: 'TCS', description: 'IT services Brasil' },
  { slug: 'wipro', name: 'Wipro', description: 'IT services Brasil' },
  { slug: 'infosys', name: 'Infosys', description: 'IT services Brasil' },
  { slug: 'capgemini', name: 'Capgemini', description: 'Consulting Brasil' },
  { slug: 'cognizant', name: 'Cognizant', description: 'IT services Brasil' },
  { slug: 'atos', name: 'Atos', description: 'IT services Brasil' },
  { slug: 'softtek', name: 'Softtek', description: 'IT services México/Brasil' },
  { slug: 'stefanini', name: 'Stefanini', description: 'IT services Brasil' },
  { slug: 'ciandt', name: 'CI&T', description: 'Digital transformation Brasil' },
  { slug: 'matera', name: 'Matera', description: 'Software development Brasil' },
  { slug: 'objective', name: 'Objective', description: 'Software development Brasil' },
  { slug: 'ilegra', name: 'Ilegra', description: 'Software development Brasil' },
  { slug: 'b2w', name: 'B2W Digital', description: 'E-commerce Brasil' },
  { slug: 'ciandt', name: 'CI&T', description: 'Digital transformation Brasil' },

  // México
  { slug: 'softtek', name: 'Softtek', description: 'IT services México' },
  { slug: 'nearshore', name: 'Nearshore', description: 'Software development México' },
  { slug: 'kueski', name: 'Kueski', description: 'FinTech México' },
  { slug: 'clip', name: 'Clip', description: 'Payments México' },
  { slug: 'konfio', name: 'Konfio', description: 'FinTech México' },
  { slug: 'uala', name: 'Ualá', description: 'FinTech México' },
  { slug: 'stori', name: 'Stori', description: 'Credit card México' },
  { slug: 'merama', name: 'Merama', description: 'E-commerce aggregator México' },
  { slug: 'kavak', name: 'Kavak', description: 'Used car marketplace México' },
  { slug: 'rappi', name: 'Rappi', description: 'Super app delivery México' },
  { slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery México' },
  { slug: 'clara', name: 'Clara', description: 'FinTech México' },
  { slug: 'bitso', name: 'Bitso', description: 'Crypto exchange México' },
  { slug: 'volta', name: 'Volta', description: 'Electric vehicle charging México' },
  { slug: 'justo', name: 'Justo', description: 'Grocery delivery México' },
  { slug: 'jokr', name: 'Jokr', description: 'Quick commerce México' },
  { slug: 'lana', name: 'Lana', description: 'FinTech México' },
  { slug: 'zenfi', name: 'Zenfi', description: 'Financial wellness México' },
  { slug: 'albo', name: 'Albo', description: 'Digital bank México' },
  { slug: 'cuenca', name: 'Cuenca', description: 'Digital bank México' },
  { slug: 'stori', name: 'Stori', description: 'Credit card México' },
  { slug: 'kueski', name: 'Kueski', description: 'FinTech México' },
  { slug: 'clip', name: 'Clip', description: 'Payments México' },
  { slug: 'uala', name: 'Ualá', description: 'FinTech México' },
  { slug: 'merama', name: 'Merama', description: 'E-commerce aggregator México' },
  { slug: 'kavak', name: 'Kavak', description: 'Used car marketplace México' },
  { slug: 'rappi', name: 'Rappi', description: 'Super app delivery México' },
  { slug: 'cornershop', name: 'Cornershop', description: 'Grocery delivery México' },
  { slug: 'clara', name: 'Clara', description: 'FinTech México' },
  { slug: 'bitso', name: 'Bitso', description: 'Crypto exchange México' },
  { slug: 'volta', name: 'Volta', description: 'Electric vehicle charging México' },
  { slug: 'justo', name: 'Justo', description: 'Grocery delivery México' },
  { slug: 'jokr', name: 'Jokr', description: 'Quick commerce México' },
  { slug: 'lana', name: 'Lana', description: 'FinTech México' },
  { slug: 'zenfi', name: 'Zenfi', description: 'Financial wellness México' },
  { slug: 'albo', name: 'Albo', description: 'Digital bank México' },
  { slug: 'cuenca', name: 'Cuenca', description: 'Digital bank México' },

  // Argentina
  { slug: 'globant', name: 'Globant', description: 'Digital transformation Argentina' },
  { slug: 'bairesdev', name: 'BairesDev', description: 'Software outsourcing Argentina' },
  { slug: 'southworks', name: 'SOUTHWORKS', description: 'Software development Argentina' },
  { slug: 'proppel', name: 'Proppel', description: 'Top 1% talent Argentina' },
  { slug: 'nearsure', name: 'Nearsure', description: 'Staff augmentation Argentina' },
  { slug: 'azumo', name: 'Azumo', description: 'Software development Argentina' },
  { slug: 'mercadolibre', name: 'Mercado Libre', description: 'E-commerce Argentina' },
  { slug: 'despegar', name: 'Despegar', description: 'Travel tech Argentina' },
  { slug: 'auth0', name: 'Auth0', description: 'Identity platform Argentina' },
  { slug: 'avature', name: 'Avature', description: 'HR software Argentina' },
  { slug: 'uala', name: 'Ualá', description: 'FinTech Argentina' },
  { slug: 'belo', name: 'Belo', description: 'Crypto wallet Argentina' },
  { slug: 'ripio', name: 'Ripio', description: 'Crypto exchange Argentina' },
  { slug: 'buenbit', name: 'Buenbit', description: 'Crypto exchange Argentina' },
  { slug: 'lemon', name: 'Lemon', description: 'Crypto wallet Argentina' },
  { slug: 'bitso', name: 'Bitso', description: 'Crypto exchange Argentina' },
  { slug: 'wolox', name: 'Wolox', description: 'Software development Argentina' },
  { slug: 'intive', name: 'Intive', description: 'Software development Argentina' },
  { slug: 'hexacta', name: 'Hexacta', description: 'Software development Argentina' },
  { slug: 'abstracta', name: 'Abstracta', description: 'Software testing Argentina' },
  { slug: 'endava', name: 'Endava', description: 'Software development Argentina' },
  { slug: 'pragmatech', name: 'Pragmatech', description: 'Software development Argentina' },
  { slug: 'baufest', name: 'Baufest', description: 'Software development Argentina' },
  { slug: 'makingsense', name: 'Making Sense', description: 'Software development Argentina' },
  { slug: 'rootstrap', name: 'Rootstrap', description: 'Software development Argentina' },
  { slug: '10pines', name: '10Pines', description: 'Software development Argentina' },
  { slug: 'abstracta', name: 'Abstracta', description: 'Software testing Argentina' },
  { slug: 'endava', name: 'Endava', description: 'Software development Argentina' },
  { slug: 'pragmatech', name: 'Pragmatech', description: 'Software development Argentina' },
  { slug: 'baufest', name: 'Baufest', description: 'Software development Argentina' },
  { slug: 'makingsense', name: 'Making Sense', description: 'Software development Argentina' },
  { slug: 'rootstrap', name: 'Rootstrap', description: 'Software development Argentina' },
  { slug: '10pines', name: '10Pines', description: 'Software development Argentina' },

  // Colômbia
  { slug: 'rappi', name: 'Rappi', description: 'Super app delivery Colômbia' },
  { slug: 'addi', name: 'Addi', description: 'Buy now pay later Colômbia' },
  { slug: 'lulo', name: 'Lulo', description: 'Digital bank Colômbia' },
  { slug: 'tul', name: 'Tul', description: 'FinTech Colômbia' },
  { slug: 'nu', name: 'Nu Colombia', description: 'Nubank Colômbia' },
  { slug: 'davivienda', name: 'Davivienda', description: 'Bank Colômbia' },
  { slug: 'bancolombia', name: 'Bancolombia', description: 'Bank Colômbia' },
  { slug: 'globant', name: 'Globant', description: 'Digital transformation Colômbia' },
  { slug: 'endava', name: 'Endava', description: 'Software development Colômbia' },
  { slug: 'perficient', name: 'Perficient', description: 'Digital transformation Colômbia' },
  { slug: 'globant', name: 'Globant', description: 'Digital transformation Colômbia' },
  { slug: 'endava', name: 'Endava', description: 'Software development Colômbia' },
  { slug: 'perficient', name: 'Perficient', description: 'Digital transformation Colômbia' },

  // 🏢 CONSULTORIAS GLOBAIS que podem usar Ashby
  { slug: 'mckinsey', name: 'McKinsey', description: 'Management consulting' },
  { slug: 'bain', name: 'Bain & Company', description: 'Management consulting' },
  { slug: 'bcg', name: 'BCG', description: 'Management consulting' },
  { slug: 'accenture', name: 'Accenture', description: 'IT consulting' },
  { slug: 'deloitte', name: 'Deloitte', description: 'Consulting' },
  { slug: 'pwc', name: 'PwC', description: 'Consulting' },
  { slug: 'kpmg', name: 'KPMG', description: 'Consulting' },
  { slug: 'ey', name: 'EY', description: 'Consulting' },
  { slug: 'ibm', name: 'IBM', description: 'IT consulting' },
  { slug: 'oracle', name: 'Oracle', description: 'IT consulting' },
  { slug: 'sap', name: 'SAP', description: 'IT consulting' },
  { slug: 'salesforce', name: 'Salesforce', description: 'CRM consulting' },
  { slug: 'microsoft', name: 'Microsoft', description: 'IT consulting' },
  { slug: 'amazon', name: 'Amazon', description: 'Cloud consulting' },
  { slug: 'google', name: 'Google', description: 'Cloud consulting' },
  { slug: 'tcs', name: 'TCS', description: 'IT services' },
  { slug: 'wipro', name: 'Wipro', description: 'IT services' },
  { slug: 'infosys', name: 'Infosys', description: 'IT services' },
  { slug: 'capgemini', name: 'Capgemini', description: 'IT consulting' },
  { slug: 'cognizant', name: 'Cognizant', description: 'IT services' },
  { slug: 'atos', name: 'Atos', description: 'IT services' },
  { slug: 'dXC', name: 'DXC Technology', description: 'IT services' },
  { slug: 'hcl', name: 'HCL Technologies', description: 'IT services' },
  { slug: 'techmahindra', name: 'Tech Mahindra', description: 'IT services' },
  { slug: 'mindtree', name: 'Mindtree', description: 'IT services' },
  { slug: 'lti', name: 'LTI', description: 'IT services' },
  { slug: 'mphasis', name: 'Mphasis', description: 'IT services' },
  { slug: 'hexaware', name: 'Hexaware', description: 'IT services' },
  { slug: 'zensar', name: 'Zensar', description: 'IT services' },
  { slug: 'persistent', name: 'Persistent Systems', description: 'IT services' },
  { slug: 'cyient', name: 'Cyient', description: 'IT services' },
  { slug: 'sonata', name: 'Sonata Software', description: 'IT services' },
  { slug: 'ramco', name: 'Ramco Systems', description: 'IT services' },
  { slug: 'niit', name: 'NIIT', description: 'IT training' },
  { slug: 'aptech', name: 'Aptech', description: 'IT training' },
  { slug: 'newhorizons', name: 'New Horizons', description: 'IT training' },
  { slug: 'globant', name: 'Globant', description: 'Digital transformation' },
  { slug: 'endava', name: 'Endava', description: 'Software development' },
  { slug: 'perficient', name: 'Perficient', description: 'Digital transformation' },
  { slug: 'epam', name: 'EPAM Systems', description: 'Software development' },
  { slug: 'luxoft', name: 'Luxoft', description: 'Software development' },
  { slug: 'intellectsoft', name: 'Intellectsoft', description: 'Software development' },
  { slug: 'softserve', name: 'SoftServe', description: 'Software development' },
  { slug: 'ciklum', name: 'Ciklum', description: 'Software development' },
  { slug: 'n-i-x', name: 'N-iX', description: 'Software development' },
  { slug: 'eleks', name: 'ELEKS', description: 'Software development' },
  { slug: 'sigma', name: 'Sigma Software', description: 'Software development' },
  { slug: 'lemon', name: 'Lemon.io', description: 'Software development' },
  { slug: 'toptal', name: 'Toptal', description: 'Freelance network' },
  { slug: 'andela', name: 'Andela', description: 'Talent marketplace' },
  { slug: 'turing', name: 'Turing', description: 'Remote developers' },
  { slug: 'crossover', name: 'Crossover', description: 'Remote talent' },
  { slug: 'xteam', name: 'X-Team', description: 'Dev augmentation' },
  { slug: 'clevertech', name: 'Clevertech', description: 'Dev consultancy' },
  { slug: 'arc', name: 'Arc.dev', description: 'Developer jobs' },
  { slug: 'gun.io', name: 'Gun.io', description: 'Freelance developers' },
  { slug: 'codementor', name: 'Codementor', description: 'Developer mentorship' },
  { slug: 'hackhands', name: 'HackHands', description: 'Developer support' },
  { slug: 'thinkful', name: 'Thinkful', description: 'Coding bootcamp' },
  { slug: 'flatiron', name: 'Flatiron School', description: 'Coding bootcamp' },
  { slug: 'generalassembly', name: 'General Assembly', description: 'Coding bootcamp' },
  { slug: 'appacademy', name: 'App Academy', description: 'Coding bootcamp' },
  { slug: 'lambda', name: 'Lambda School', description: 'Coding bootcamp' },
  { slug: 'hackreactor', name: 'Hack Reactor', description: 'Coding bootcamp' },
  { slug: 'galvanize', name: 'Galvanize', description: 'Coding bootcamp' },
  { slug: 'bloc', name: 'Bloc', description: 'Coding bootcamp' },
  { slug: 'devbootcamp', name: 'Dev Bootcamp', description: 'Coding bootcamp' },
  { slug: 'makersquare', name: 'MakerSquare', description: 'Coding bootcamp' },
  { slug: 'metis', name: 'Metis', description: 'Data science bootcamp' },
  { slug: 'datacamp', name: 'DataCamp', description: 'Data science training' },
  { slug: 'datquest', name: 'DataQuest', description: 'Data science training' },
  { slug: 'kaggle', name: 'Kaggle', description: 'Data science platform' },
  { slug: 'datacamp', name: 'DataCamp', description: 'Data science training' },
  { slug: 'datquest', name: 'DataQuest', description: 'Data science training' },
  { slug: 'kaggle', name: 'Kaggle', description: 'Data science platform' },

  // 🚀 Startups & Scale-ups adicionais conhecidas que usam Ashby
  { slug: 'lattice', name: 'Lattice', description: 'People management platform' },
  { slug: 'gem', name: 'Gem', description: 'Recruiting platform' },
  { slug: 'goodtime', name: 'GoodTime', description: 'Interview scheduling' },
  { slug: 'comp', name: 'Comp', description: 'Compensation platform' },
  { slug: 'pave', name: 'Pave', description: 'Compensation data' },
  { slug: 'chartio', name: 'Chartio', description: 'Business intelligence' },
  { slug: 'segment', name: 'Segment', description: 'Customer data platform' },
  { slug: 'mixpanel', name: 'Mixpanel', description: 'Product analytics' },
  { slug: 'amplitude', name: 'Amplitude', description: 'Product analytics' },
  { slug: 'heap', name: 'Heap', description: 'Product analytics' },
  { slug: 'sentry', name: 'Sentry', description: 'Error tracking' },
  { slug: 'rollbar', name: 'Rollbar', description: 'Error tracking' },
  { slug: 'bugsnag', name: 'Bugsnag', description: 'Error tracking' },
  { slug: 'honeycomb', name: 'Honeycomb', description: 'Observability platform' },
  { slug: 'lightstep', name: 'Lightstep', description: 'Observability platform' },
  { slug: 'datadog', name: 'Datadog', description: 'Monitoring & analytics' },
  { slug: 'newrelic', name: 'New Relic', description: 'Observability platform' },
  { slug: 'sumologic', name: 'Sumo Logic', description: 'Log management' },
  { slug: 'splunk', name: 'Splunk', description: 'Data platform' },

  // 💰 FinTech adicionais
  { slug: 'affirm', name: 'Affirm', description: 'Buy now pay later' },
  { slug: 'klarna', name: 'Klarna', description: 'Buy now pay later' },
  { slug: 'afterpay', name: 'Afterpay', description: 'Buy now pay later' },
  { slug: 'square', name: 'Square', description: 'Payment processing' },
  { slug: 'block', name: 'Block', description: 'Square parent company' },
  { slug: 'cashapp', name: 'Cash App', description: 'Mobile payments' },
  { slug: 'chime', name: 'Chime', description: 'Digital banking' },
  { slug: 'revolut', name: 'Revolut', description: 'Digital banking' },
  { slug: 'n26', name: 'N26', description: 'Digital banking' },
  { slug: 'monzo', name: 'Monzo', description: 'Digital banking' },
  { slug: 'wise', name: 'Wise', description: 'Money transfer' },
  { slug: 'remitly', name: 'Remitly', description: 'Money transfer' },
  { slug: 'worldremit', name: 'WorldRemit', description: 'Money transfer' },

  // 🛠️ Dev Tools & Infrastructure adicionais
  { slug: 'github', name: 'GitHub', description: 'Code hosting platform' },
  { slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
  { slug: 'bitbucket', name: 'Bitbucket', description: 'Code hosting' },
  { slug: 'circleci', name: 'CircleCI', description: 'CI/CD platform' },
  { slug: 'travisci', name: 'Travis CI', description: 'CI/CD platform' },
  { slug: 'jenkins', name: 'Jenkins', description: 'CI/CD automation' },
  { slug: 'teamcity', name: 'TeamCity', description: 'CI/CD platform' },
  { slug: 'bamboo', name: 'Bamboo', description: 'CI/CD platform' },
  { slug: 'codeship', name: 'Codeship', description: 'CI/CD platform' },
  { slug: 'semaphore', name: 'Semaphore', description: 'CI/CD platform' },
  { slug: 'appveyor', name: 'AppVeyor', description: 'CI/CD platform' },
  { slug: 'buddy', name: 'Buddy', description: 'CI/CD platform' },
  { slug: 'drone', name: 'Drone', description: 'CI/CD platform' },
  { slug: 'wercker', name: 'Wercker', description: 'CI/CD platform' },
  { slug: 'shippable', name: 'Shippable', description: 'CI/CD platform' },
  { slug: 'codefresh', name: 'Codefresh', description: 'CI/CD platform' },
  { slug: 'harness', name: 'Harness', description: 'CI/CD platform' },
  { slug: 'spinnaker', name: 'Spinnaker', description: 'CI/CD platform' },
  { slug: 'argo', name: 'Argo', description: 'CI/CD platform' },
  { slug: 'tekton', name: 'Tekton', description: 'CI/CD platform' },
  { slug: 'flux', name: 'Flux', description: 'GitOps platform' },
  { slug: 'weaveworks', name: 'Weaveworks', description: 'GitOps platform' },
  { slug: 'octopus', name: 'Octopus Deploy', description: 'Deployment automation' },
  { slug: 'deployhq', name: 'DeployHQ', description: 'Deployment platform' },
  { slug: 'deploybot', name: 'DeployBot', description: 'Deployment platform' },
  { slug: 'deployer', name: 'Deployer', description: 'Deployment tool' },
  { slug: 'capistrano', name: 'Capistrano', description: 'Deployment tool' },
  { slug: 'fabric', name: 'Fabric', description: 'Deployment tool' },
  { slug: 'ansible', name: 'Ansible', description: 'Configuration management' },
  { slug: 'chef', name: 'Chef', description: 'Configuration management' },
  { slug: 'puppet', name: 'Puppet', description: 'Configuration management' },
  { slug: 'salt', name: 'Salt', description: 'Configuration management' },
  { slug: 'terraform', name: 'Terraform', description: 'Infrastructure as code' },
  { slug: 'pulumi', name: 'Pulumi', description: 'Infrastructure as code' },
];

interface DiscoveredCompany {
  slug: string;
  name: string;
  description?: string;
  hasJobs: boolean;
  jobCount?: number;
}

/**
 * Testa se uma empresa existe no Ashby fazendo uma requisição à API
 */
async function testAshbyCompany(
  candidate: AshbyCompanyCandidate,
): Promise<DiscoveredCompany | null> {
  const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${candidate.slug}`;

  try {
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      validateStatus: (status) => status < 500, // Aceita 404, mas não 500+
    });

    // Se retornou 200, a empresa existe
    if (response.status === 200) {
      const jobs = response.data?.jobs || [];
      return {
        slug: candidate.slug,
        name: candidate.name,
        description: candidate.description,
        hasJobs: jobs.length > 0,
        jobCount: jobs.length,
      };
    }

    // 404 significa que a empresa não existe ou não usa Ashby
    return null;
  } catch (error: any) {
    // Erros de rede ou timeout
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn(`  ⚠️  ${candidate.name}: Erro de conexão`);
      return null;
    }

    // Outros erros
    return null;
  }
}

/**
 * Descobre empresas do Ashby testando a API
 */
export async function discoverAshbyCompanies(
  options: {
    maxConcurrent?: number;
    delayMs?: number;
    verbose?: boolean;
  } = {},
): Promise<DiscoveredCompany[]> {
  const { maxConcurrent = 5, delayMs = 500, verbose = true } = options;

  if (verbose) {
    console.log('🔍 Iniciando descoberta de empresas do Ashby...');
    console.log(`📋 Testando ${ASHBY_COMPANY_CANDIDATES.length} empresas candidatas\n`);
  }

  const discovered: DiscoveredCompany[] = [];
  const failed: string[] = [];

  // Processa em batches para não sobrecarregar
  for (let i = 0; i < ASHBY_COMPANY_CANDIDATES.length; i += maxConcurrent) {
    const batch = ASHBY_COMPANY_CANDIDATES.slice(i, i + maxConcurrent);
    const batchNum = Math.floor(i / maxConcurrent) + 1;
    const totalBatches = Math.ceil(ASHBY_COMPANY_CANDIDATES.length / maxConcurrent);

    if (verbose) {
      console.log(
        `📦 Processando batch ${batchNum}/${totalBatches} (${batch.length} empresas)...`,
      );
    }

    const results = await Promise.all(
      batch.map(async (candidate) => {
        const result = await testAshbyCompany(candidate);
        if (result) {
          if (verbose) {
            console.log(
              `  ✅ ${candidate.name} (${candidate.slug}): ${result.jobCount || 0} vagas`,
            );
          }
          return result;
        } else {
          if (verbose) {
            console.log(`  ❌ ${candidate.name} (${candidate.slug}): Não encontrada`);
          }
          failed.push(candidate.slug);
          return null;
        }
      }),
    );

    // Adiciona empresas descobertas
    for (const result of results) {
      if (result) {
        discovered.push(result);
      }
    }

    // Delay entre batches
    if (i + maxConcurrent < ASHBY_COMPANY_CANDIDATES.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  if (verbose) {
    console.log('\n📊 Resumo da descoberta:');
    console.log(`  ✅ Empresas encontradas: ${discovered.length}`);
    console.log(`  ❌ Empresas não encontradas: ${failed.length}`);
    console.log(`  📈 Taxa de sucesso: ${((discovered.length / ASHBY_COMPANY_CANDIDATES.length) * 100).toFixed(1)}%`);
  }

  return discovered;
}

/**
 * Executa a descoberta e retorna lista formatada para o seed
 */
export async function getDiscoveredAshbyCompanies(): Promise<
  Array<{ slug: string; name: string; url: string }>
> {
  const discovered = await discoverAshbyCompanies();

  return discovered.map((company) => ({
    slug: company.slug,
    name: company.name,
    url: `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`,
  }));
}

