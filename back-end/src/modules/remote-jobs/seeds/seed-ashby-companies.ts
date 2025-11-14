import { DataSource } from 'typeorm';

/**
 * Script para popular job_boards e job_board_companies com as empresas do Ashby
 * Execute com: npm run seed:ashby
 * 
 * Este seed inclui uma lista expandida de empresas do Ashby baseada em:
 * - Empresas já verificadas
 * - Lista do arquivo TODAS_EMPRESAS_CONSOLIDADAS.md
 */
export async function seedAshbyCompanies(
  dataSource: DataSource,
  options: { discoverCompanies?: boolean } = {},
) {
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const companyRepo = dataSource.getRepository('companies');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed das empresas Ashby...');

  // 1. Criar/buscar o job board "ashby"
  let ashbyBoard = await jobBoardRepo.findOne({
    where: { slug: 'ashby' },
  });

  if (!ashbyBoard) {
    ashbyBoard = await jobBoardRepo.save({
      slug: 'ashby',
      name: 'AshbyHQ',
      url: 'https://jobs.ashbyhq.com',
      scraper: 'ashby',
      enabled: true,
      priority: 2,
      description: 'Plataforma de ATS moderna usada por startups e empresas tech',
    });
    console.log('✅ Job board "ashby" criado');
  } else {
    console.log('ℹ️  Job board "ashby" já existe');
  }

  // 2. Lista expandida de empresas do Ashby
  // Inclui empresas verificadas + lista do TODAS_EMPRESAS_CONSOLIDADAS.md
  let companies: Array<{ slug: string; name: string; url: string }> = [
    // Tech/SaaS - Verificadas
    { slug: 'Neon', name: 'Neon', url: 'https://api.ashbyhq.com/posting-api/job-board/Neon' },
    { slug: 'Census', name: 'Census', url: 'https://api.ashbyhq.com/posting-api/job-board/Census' },
    { slug: 'Ramp', name: 'Ramp', url: 'https://api.ashbyhq.com/posting-api/job-board/Ramp' },
    { slug: 'Deel', name: 'Deel', url: 'https://api.ashbyhq.com/posting-api/job-board/Deel' },
    { slug: 'Modal', name: 'Modal', url: 'https://api.ashbyhq.com/posting-api/job-board/Modal' },
    { slug: 'Ashby', name: 'Ashby', url: 'https://api.ashbyhq.com/posting-api/job-board/Ashby' },
    { slug: 'Mercury', name: 'Mercury', url: 'https://api.ashbyhq.com/posting-api/job-board/Mercury' },
    { slug: 'Middesk', name: 'Middesk', url: 'https://api.ashbyhq.com/posting-api/job-board/Middesk' },
    { slug: 'Supabase', name: 'Supabase', url: 'https://api.ashbyhq.com/posting-api/job-board/Supabase' },
    { slug: 'Vanta', name: 'Vanta', url: 'https://api.ashbyhq.com/posting-api/job-board/Vanta' },

    // AI/ML - Verificadas
    { slug: 'Scale', name: 'Scale AI', url: 'https://api.ashbyhq.com/posting-api/job-board/Scale' },
    { slug: 'Anthropic', name: 'Anthropic', url: 'https://api.ashbyhq.com/posting-api/job-board/Anthropic' },
    { slug: 'Weights-Biases', name: 'Weights & Biases', url: 'https://api.ashbyhq.com/posting-api/job-board/Weights-Biases' },
    { slug: 'Cohere', name: 'Cohere', url: 'https://api.ashbyhq.com/posting-api/job-board/Cohere' },
    { slug: 'Harvey', name: 'Harvey', url: 'https://api.ashbyhq.com/posting-api/job-board/Harvey' },

    // FinTech - Verificadas
    { slug: 'Brex', name: 'Brex', url: 'https://api.ashbyhq.com/posting-api/job-board/Brex' },
    { slug: 'Plaid', name: 'Plaid', url: 'https://api.ashbyhq.com/posting-api/job-board/Plaid' },
    { slug: 'Stripe', name: 'Stripe', url: 'https://api.ashbyhq.com/posting-api/job-board/Stripe' },
    { slug: 'Gusto', name: 'Gusto', url: 'https://api.ashbyhq.com/posting-api/job-board/Gusto' },
    { slug: 'Modern-Treasury', name: 'Modern Treasury', url: 'https://api.ashbyhq.com/posting-api/job-board/Modern-Treasury' },

    // Developer Tools - Verificadas
    { slug: 'Vercel', name: 'Vercel', url: 'https://api.ashbyhq.com/posting-api/job-board/Vercel' },
    { slug: 'Retool', name: 'Retool', url: 'https://api.ashbyhq.com/posting-api/job-board/Retool' },
    { slug: 'Render', name: 'Render', url: 'https://api.ashbyhq.com/posting-api/job-board/Render' },
    { slug: 'Fly', name: 'Fly.io', url: 'https://api.ashbyhq.com/posting-api/job-board/Fly' },
    { slug: 'WorkOS', name: 'WorkOS', url: 'https://api.ashbyhq.com/posting-api/job-board/WorkOS' },

    // Lista expandida do TODAS_EMPRESAS_CONSOLIDADAS.md
    // LATAM Focused & Remote-First
    { slug: 'truelogic', name: 'Truelogic', url: 'https://api.ashbyhq.com/posting-api/job-board/truelogic' },
    { slug: 'agent', name: 'Agent', url: 'https://api.ashbyhq.com/posting-api/job-board/agent' },
    { slug: 'nango', name: 'Nango', url: 'https://api.ashbyhq.com/posting-api/job-board/nango' },
    { slug: 'rutter', name: 'Rutter', url: 'https://api.ashbyhq.com/posting-api/job-board/rutter' },
    { slug: 'elevenlabs', name: 'ElevenLabs', url: 'https://api.ashbyhq.com/posting-api/job-board/elevenlabs' },
    { slug: 'notion', name: 'Notion', url: 'https://api.ashbyhq.com/posting-api/job-board/notion' },
    { slug: 'linear', name: 'Linear', url: 'https://api.ashbyhq.com/posting-api/job-board/linear' },
    { slug: 'replit', name: 'Replit', url: 'https://api.ashbyhq.com/posting-api/job-board/replit' },
    { slug: 'posthog', name: 'PostHog', url: 'https://api.ashbyhq.com/posting-api/job-board/posthog' },
    { slug: 'clay', name: 'Clay', url: 'https://api.ashbyhq.com/posting-api/job-board/clay' },
    { slug: 'wander', name: 'Wander', url: 'https://api.ashbyhq.com/posting-api/job-board/wander' },
    { slug: 'whatnot', name: 'Whatnot', url: 'https://api.ashbyhq.com/posting-api/job-board/whatnot' },
    { slug: 'roompricegenie', name: 'RoomPriceGenie', url: 'https://api.ashbyhq.com/posting-api/job-board/roompricegenie' },

    // Tech Unicorns & Scale-ups
    { slug: 'shopify', name: 'Shopify', url: 'https://api.ashbyhq.com/posting-api/job-board/shopify' },
    { slug: 'snowflake', name: 'Snowflake', url: 'https://api.ashbyhq.com/posting-api/job-board/snowflake' },
    { slug: 'reddit', name: 'Reddit', url: 'https://api.ashbyhq.com/posting-api/job-board/reddit' },
    { slug: 'duolingo', name: 'Duolingo', url: 'https://api.ashbyhq.com/posting-api/job-board/duolingo' },
    { slug: 'uipath', name: 'UiPath', url: 'https://api.ashbyhq.com/posting-api/job-board/uipath' },
    { slug: 'zapier', name: 'Zapier', url: 'https://api.ashbyhq.com/posting-api/job-board/zapier' },
    { slug: 'deliveroo', name: 'Deliveroo', url: 'https://api.ashbyhq.com/posting-api/job-board/deliveroo' },
    { slug: 'lime', name: 'Lime', url: 'https://api.ashbyhq.com/posting-api/job-board/lime' },
    { slug: 'lemonade', name: 'Lemonade', url: 'https://api.ashbyhq.com/posting-api/job-board/lemonade' },
    { slug: 'gorgias', name: 'Gorgias', url: 'https://api.ashbyhq.com/posting-api/job-board/gorgias' },
    { slug: 'ironclad', name: 'Ironclad', url: 'https://api.ashbyhq.com/posting-api/job-board/ironclad' },
    { slug: 'fullstory', name: 'FullStory', url: 'https://api.ashbyhq.com/posting-api/job-board/fullstory' },
    { slug: 'marqeta', name: 'Marqeta', url: 'https://api.ashbyhq.com/posting-api/job-board/marqeta' },
    { slug: 'dave', name: 'Dave', url: 'https://api.ashbyhq.com/posting-api/job-board/dave' },
    { slug: 'multiverse', name: 'Multiverse', url: 'https://api.ashbyhq.com/posting-api/job-board/multiverse' },
    { slug: 'flock-safety', name: 'Flock Safety', url: 'https://api.ashbyhq.com/posting-api/job-board/flock-safety' },
    { slug: 'form-energy', name: 'Form Energy', url: 'https://api.ashbyhq.com/posting-api/job-board/form-energy' },
    { slug: 'aurora-solar', name: 'Aurora Solar', url: 'https://api.ashbyhq.com/posting-api/job-board/aurora-solar' },
    { slug: 'eightsleep', name: 'EightSleep', url: 'https://api.ashbyhq.com/posting-api/job-board/eightsleep' },
    { slug: 'hackerone', name: 'HackerOne', url: 'https://api.ashbyhq.com/posting-api/job-board/hackerone' },
    { slug: 'brightline', name: 'Brightline', url: 'https://api.ashbyhq.com/posting-api/job-board/brightline' },
    { slug: 'monte-carlo', name: 'Monte Carlo', url: 'https://api.ashbyhq.com/posting-api/job-board/monte-carlo' },
    { slug: 'coder', name: 'Coder', url: 'https://api.ashbyhq.com/posting-api/job-board/coder' },
    { slug: 'boomi', name: 'Boomi', url: 'https://api.ashbyhq.com/posting-api/job-board/boomi' },
    { slug: 'netgear', name: 'NETGEAR', url: 'https://api.ashbyhq.com/posting-api/job-board/netgear' },

    // FinTech & Crypto
    { slug: 'column', name: 'Column', url: 'https://api.ashbyhq.com/posting-api/job-board/column' },
    { slug: 'unit', name: 'Unit', url: 'https://api.ashbyhq.com/posting-api/job-board/unit' },
    { slug: 'increase', name: 'Increase', url: 'https://api.ashbyhq.com/posting-api/job-board/increase' },
    { slug: 'lithic', name: 'Lithic', url: 'https://api.ashbyhq.com/posting-api/job-board/lithic' },
    { slug: 'ledger', name: 'Ledger', url: 'https://api.ashbyhq.com/posting-api/job-board/ledger' },
    { slug: 'anchorage', name: 'Anchorage', url: 'https://api.ashbyhq.com/posting-api/job-board/anchorage' },
    { slug: 'fireblocks', name: 'Fireblocks', url: 'https://api.ashbyhq.com/posting-api/job-board/fireblocks' },
    { slug: 'trmlabs', name: 'TRM Labs', url: 'https://api.ashbyhq.com/posting-api/job-board/trmlabs' },

    // Dev Tools & Infrastructure
    { slug: 'railway', name: 'Railway', url: 'https://api.ashbyhq.com/posting-api/job-board/railway' },
    { slug: 'planetscale', name: 'PlanetScale', url: 'https://api.ashbyhq.com/posting-api/job-board/planetscale' },
    { slug: 'convex', name: 'Convex', url: 'https://api.ashbyhq.com/posting-api/job-board/convex' },
    { slug: 'valtown', name: 'Val Town', url: 'https://api.ashbyhq.com/posting-api/job-board/valtown' },
    { slug: 'mintlify', name: 'Mintlify', url: 'https://api.ashbyhq.com/posting-api/job-board/mintlify' },
    { slug: 'readme', name: 'ReadMe', url: 'https://api.ashbyhq.com/posting-api/job-board/readme' },

    // AI & Machine Learning
    { slug: 'character', name: 'Character.AI', url: 'https://api.ashbyhq.com/posting-api/job-board/character' },
    { slug: 'cognition', name: 'Cognition Labs', url: 'https://api.ashbyhq.com/posting-api/job-board/cognition' },
    { slug: 'perplexity', name: 'Perplexity', url: 'https://api.ashbyhq.com/posting-api/job-board/perplexity' },
    { slug: 'glean', name: 'Glean', url: 'https://api.ashbyhq.com/posting-api/job-board/glean' },
    { slug: 'scaleai', name: 'Scale AI', url: 'https://api.ashbyhq.com/posting-api/job-board/scaleai' },
    { slug: 'wandb', name: 'Weights & Biases', url: 'https://api.ashbyhq.com/posting-api/job-board/wandb' },
    { slug: 'huggingface', name: 'Hugging Face', url: 'https://api.ashbyhq.com/posting-api/job-board/huggingface' },
    { slug: 'replicate', name: 'Replicate', url: 'https://api.ashbyhq.com/posting-api/job-board/replicate' },
    { slug: 'langchain', name: 'LangChain', url: 'https://api.ashbyhq.com/posting-api/job-board/langchain' },
    { slug: 'together', name: 'Together AI', url: 'https://api.ashbyhq.com/posting-api/job-board/together' },

    // Others - SaaS, E-commerce, etc
    { slug: 'drata', name: 'Drata', url: 'https://api.ashbyhq.com/posting-api/job-board/drata' },
    { slug: 'secureframe', name: 'Secureframe', url: 'https://api.ashbyhq.com/posting-api/job-board/secureframe' },
    { slug: 'attio', name: 'Attio', url: 'https://api.ashbyhq.com/posting-api/job-board/attio' },
    { slug: 'folk', name: 'Folk', url: 'https://api.ashbyhq.com/posting-api/job-board/folk' },
    { slug: 'sequoia', name: 'Sequoia', url: 'https://api.ashbyhq.com/posting-api/job-board/sequoia' },

    // 🌎 EMPRESAS LATAM - América Latina
    // Brasil - Principais
    { slug: 'nubank', name: 'Nubank', url: 'https://api.ashbyhq.com/posting-api/job-board/nubank' },
    { slug: 'quintoandar', name: 'QuintoAndar', url: 'https://api.ashbyhq.com/posting-api/job-board/quintoandar' },
    { slug: 'loft', name: 'Loft', url: 'https://api.ashbyhq.com/posting-api/job-board/loft' },
    { slug: 'creditas', name: 'Creditas', url: 'https://api.ashbyhq.com/posting-api/job-board/creditas' },
    { slug: 'stone', name: 'Stone', url: 'https://api.ashbyhq.com/posting-api/job-board/stone' },
    { slug: 'ifood', name: 'iFood', url: 'https://api.ashbyhq.com/posting-api/job-board/ifood' },
    { slug: 'vtex', name: 'VTEX', url: 'https://api.ashbyhq.com/posting-api/job-board/vtex' },
    { slug: 'olist', name: 'Olist', url: 'https://api.ashbyhq.com/posting-api/job-board/olist' },
    { slug: 'nuvemshop', name: 'Nuvemshop', url: 'https://api.ashbyhq.com/posting-api/job-board/nuvemshop' },
    { slug: 'magazineluiza', name: 'Magazine Luiza', url: 'https://api.ashbyhq.com/posting-api/job-board/magazineluiza' },
    { slug: 'wildlifestudios', name: 'Wildlife Studios', url: 'https://api.ashbyhq.com/posting-api/job-board/wildlifestudios' },
    { slug: 'loggi', name: 'Loggi', url: 'https://api.ashbyhq.com/posting-api/job-board/loggi' },
    { slug: 'gympass', name: 'Gympass', url: 'https://api.ashbyhq.com/posting-api/job-board/gympass' },
    { slug: 'pagseguro', name: 'PagSeguro', url: 'https://api.ashbyhq.com/posting-api/job-board/pagseguro' },
    { slug: 'picpay', name: 'PicPay', url: 'https://api.ashbyhq.com/posting-api/job-board/picpay' },
    { slug: 'bancointer', name: 'Banco Inter', url: 'https://api.ashbyhq.com/posting-api/job-board/bancointer' },
    { slug: 'c6bank', name: 'C6 Bank', url: 'https://api.ashbyhq.com/posting-api/job-board/c6bank' },
    { slug: 'bairesdev', name: 'BairesDev', url: 'https://api.ashbyhq.com/posting-api/job-board/bairesdev' },

    // México
    { slug: 'kavak', name: 'Kavak', url: 'https://api.ashbyhq.com/posting-api/job-board/kavak' },
    { slug: 'clip', name: 'Clip', url: 'https://api.ashbyhq.com/posting-api/job-board/clip' },
    { slug: 'konfio', name: 'Konfio', url: 'https://api.ashbyhq.com/posting-api/job-board/konfio' },
    { slug: 'rappi', name: 'Rappi', url: 'https://api.ashbyhq.com/posting-api/job-board/rappi' },
    { slug: 'cornershop', name: 'Cornershop', url: 'https://api.ashbyhq.com/posting-api/job-board/cornershop' },
    { slug: 'merama', name: 'Merama', url: 'https://api.ashbyhq.com/posting-api/job-board/merama' },
    { slug: 'clara', name: 'Clara', url: 'https://api.ashbyhq.com/posting-api/job-board/clara' },
    { slug: 'stori', name: 'Stori', url: 'https://api.ashbyhq.com/posting-api/job-board/stori' },
    { slug: 'uala', name: 'Ualá', url: 'https://api.ashbyhq.com/posting-api/job-board/uala' },

    // Argentina
    { slug: 'mercadolibre', name: 'Mercado Libre', url: 'https://api.ashbyhq.com/posting-api/job-board/mercadolibre' },
    { slug: 'despegar', name: 'Despegar', url: 'https://api.ashbyhq.com/posting-api/job-board/despegar' },
    { slug: 'auth0', name: 'Auth0', url: 'https://api.ashbyhq.com/posting-api/job-board/auth0' },
    { slug: 'avature', name: 'Avature', url: 'https://api.ashbyhq.com/posting-api/job-board/avature' },
    { slug: 'southworks', name: 'SOUTHWORKS', url: 'https://api.ashbyhq.com/posting-api/job-board/southworks' },
    { slug: 'proppel', name: 'Proppel', url: 'https://api.ashbyhq.com/posting-api/job-board/proppel' },
    { slug: 'nearsure', name: 'Nearsure', url: 'https://api.ashbyhq.com/posting-api/job-board/nearsure' },
    { slug: 'azumo', name: 'Azumo', url: 'https://api.ashbyhq.com/posting-api/job-board/azumo' },
    { slug: 'globant', name: 'Globant', url: 'https://api.ashbyhq.com/posting-api/job-board/globant' },

    // Colômbia
    { slug: 'lulo', name: 'Lulo', url: 'https://api.ashbyhq.com/posting-api/job-board/lulo' },
    { slug: 'addi', name: 'Addi', url: 'https://api.ashbyhq.com/posting-api/job-board/addi' },
    { slug: 'tul', name: 'Tul', url: 'https://api.ashbyhq.com/posting-api/job-board/tul' },

    // Outras LATAM
    { slug: 'yuno', name: 'Yuno', url: 'https://api.ashbyhq.com/posting-api/job-board/yuno' },
    { slug: 'connectly', name: 'Connectly', url: 'https://api.ashbyhq.com/posting-api/job-board/connectly' },
    { slug: 'bluelight', name: 'Bluelight Consulting', url: 'https://api.ashbyhq.com/posting-api/job-board/bluelight' },
    { slug: 'welocalize', name: 'Welocalize', url: 'https://api.ashbyhq.com/posting-api/job-board/welocalize' },

    // 🏢 CONSULTORIAS - América Latina
    // Brasil
    { slug: 'thoughtworks', name: 'Thoughtworks', url: 'https://api.ashbyhq.com/posting-api/job-board/thoughtworks' },
    { slug: 'ciandt', name: 'CI&T', url: 'https://api.ashbyhq.com/posting-api/job-board/ciandt' },
    { slug: 'stefanini', name: 'Stefanini', url: 'https://api.ashbyhq.com/posting-api/job-board/stefanini' },
    { slug: 'matera', name: 'Matera', url: 'https://api.ashbyhq.com/posting-api/job-board/matera' },
    { slug: 'objective', name: 'Objective', url: 'https://api.ashbyhq.com/posting-api/job-board/objective' },
    { slug: 'ilegra', name: 'Ilegra', url: 'https://api.ashbyhq.com/posting-api/job-board/ilegra' },
    { slug: 'accenture', name: 'Accenture', url: 'https://api.ashbyhq.com/posting-api/job-board/accenture' },
    { slug: 'deloitte', name: 'Deloitte', url: 'https://api.ashbyhq.com/posting-api/job-board/deloitte' },
    { slug: 'pwc', name: 'PwC', url: 'https://api.ashbyhq.com/posting-api/job-board/pwc' },
    { slug: 'kpmg', name: 'KPMG', url: 'https://api.ashbyhq.com/posting-api/job-board/kpmg' },
    { slug: 'tcs', name: 'TCS', url: 'https://api.ashbyhq.com/posting-api/job-board/tcs' },
    { slug: 'wipro', name: 'Wipro', url: 'https://api.ashbyhq.com/posting-api/job-board/wipro' },
    { slug: 'infosys', name: 'Infosys', url: 'https://api.ashbyhq.com/posting-api/job-board/infosys' },
    { slug: 'capgemini', name: 'Capgemini', url: 'https://api.ashbyhq.com/posting-api/job-board/capgemini' },
    { slug: 'cognizant', name: 'Cognizant', url: 'https://api.ashbyhq.com/posting-api/job-board/cognizant' },

    // Argentina - Consultorias
    { slug: 'wolox', name: 'Wolox', url: 'https://api.ashbyhq.com/posting-api/job-board/wolox' },
    { slug: 'intive', name: 'Intive', url: 'https://api.ashbyhq.com/posting-api/job-board/intive' },
    { slug: 'hexacta', name: 'Hexacta', url: 'https://api.ashbyhq.com/posting-api/job-board/hexacta' },
    { slug: 'abstracta', name: 'Abstracta', url: 'https://api.ashbyhq.com/posting-api/job-board/abstracta' },
    { slug: 'pragmatech', name: 'Pragmatech', url: 'https://api.ashbyhq.com/posting-api/job-board/pragmatech' },
    { slug: 'baufest', name: 'Baufest', url: 'https://api.ashbyhq.com/posting-api/job-board/baufest' },
    { slug: 'makingsense', name: 'Making Sense', url: 'https://api.ashbyhq.com/posting-api/job-board/makingsense' },
    { slug: 'rootstrap', name: 'Rootstrap', url: 'https://api.ashbyhq.com/posting-api/job-board/rootstrap' },
    { slug: '10pines', name: '10Pines', url: 'https://api.ashbyhq.com/posting-api/job-board/10pines' },

    // México - Consultorias
    { slug: 'softtek', name: 'Softtek', url: 'https://api.ashbyhq.com/posting-api/job-board/softtek' },
    { slug: 'nearshore', name: 'Nearshore', url: 'https://api.ashbyhq.com/posting-api/job-board/nearshore' },

    // Colômbia - Consultorias
    { slug: 'perficient', name: 'Perficient', url: 'https://api.ashbyhq.com/posting-api/job-board/perficient' },

    // 🏢 CONSULTORIAS GLOBAIS
    { slug: 'epam', name: 'EPAM Systems', url: 'https://api.ashbyhq.com/posting-api/job-board/epam' },
    { slug: 'luxoft', name: 'Luxoft', url: 'https://api.ashbyhq.com/posting-api/job-board/luxoft' },
    { slug: 'softserve', name: 'SoftServe', url: 'https://api.ashbyhq.com/posting-api/job-board/softserve' },
    { slug: 'ciklum', name: 'Ciklum', url: 'https://api.ashbyhq.com/posting-api/job-board/ciklum' },
    { slug: 'toptal', name: 'Toptal', url: 'https://api.ashbyhq.com/posting-api/job-board/toptal' },
    { slug: 'andela', name: 'Andela', url: 'https://api.ashbyhq.com/posting-api/job-board/andela' },
    { slug: 'turing', name: 'Turing', url: 'https://api.ashbyhq.com/posting-api/job-board/turing' },
    { slug: 'crossover', name: 'Crossover', url: 'https://api.ashbyhq.com/posting-api/job-board/crossover' },
    { slug: 'xteam', name: 'X-Team', url: 'https://api.ashbyhq.com/posting-api/job-board/xteam' },
    { slug: 'clevertech', name: 'Clevertech', url: 'https://api.ashbyhq.com/posting-api/job-board/clevertech' },

    // 🏢 MAIS CONSULTORIAS LATAM
    // Brasil - Adicionais
    { slug: 'seidor', name: 'SEIDOR', url: 'https://api.ashbyhq.com/posting-api/job-board/seidor' },
    { slug: 'peers', name: 'Peers Consulting', url: 'https://api.ashbyhq.com/posting-api/job-board/peers' },
    { slug: 'findhr', name: 'Find HR', url: 'https://api.ashbyhq.com/posting-api/job-board/findhr' },
    { slug: 'totvs', name: 'TOTVS', url: 'https://api.ashbyhq.com/posting-api/job-board/totvs' },
    { slug: 'linx', name: 'Linx', url: 'https://api.ashbyhq.com/posting-api/job-board/linx' },
    { slug: 'tivit', name: 'TIVIT', url: 'https://api.ashbyhq.com/posting-api/job-board/tivit' },
    { slug: 'bematech', name: 'Bematech', url: 'https://api.ashbyhq.com/posting-api/job-board/bematech' },
    { slug: 'senior', name: 'Senior', url: 'https://api.ashbyhq.com/posting-api/job-board/senior' },
    { slug: 'microsiga', name: 'Microsiga', url: 'https://api.ashbyhq.com/posting-api/job-board/microsiga' },
    { slug: 'prodam', name: 'PRODAM', url: 'https://api.ashbyhq.com/posting-api/job-board/prodam' },
    { slug: 'ciashop', name: 'CiaShop', url: 'https://api.ashbyhq.com/posting-api/job-board/ciashop' },
    { slug: 'compasso', name: 'Compasso', url: 'https://api.ashbyhq.com/posting-api/job-board/compasso' },
    
    // Chile - Consultorias
    { slug: 'cornershop', name: 'Cornershop', url: 'https://api.ashbyhq.com/posting-api/job-board/cornershop' },
    { slug: 'cornershopapp', name: 'Cornershop by Uber', url: 'https://api.ashbyhq.com/posting-api/job-board/cornershopapp' },
    
    // Peru - Consultorias
    { slug: 'globant', name: 'Globant', url: 'https://api.ashbyhq.com/posting-api/job-board/globant' },
    
    // Outras consultorias LATAM
    { slug: 'simon-kucher', name: 'Simon-Kucher', url: 'https://api.ashbyhq.com/posting-api/job-board/simon-kucher' },
  ];

  // Se a opção discoverCompanies estiver ativada, descobrir empresas dinamicamente
  if (options.discoverCompanies) {
    console.log('\n🔍 Modo descoberta ativado - testando empresas na API do Ashby...');
    const { discoverAshbyCompanies } = await import('./discover-ashby-companies');
    const discovered = await discoverAshbyCompanies({ verbose: true });

    // Adiciona empresas descobertas que não estão na lista estática
    const existingSlugs = new Set(companies.map((c) => c.slug.toLowerCase()));
    for (const company of discovered) {
      if (!existingSlugs.has(company.slug.toLowerCase())) {
        companies.push({
          slug: company.slug,
          name: company.name,
          url: `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`,
        });
      }
    }
    console.log(`\n✅ Total de empresas após descoberta: ${companies.length}\n`);
  }

  let createdCompanies = 0;
  let createdRelations = 0;
  let skippedRelations = 0;

  // 3. Para cada empresa, criar/buscar e relacionar com ashby
  for (const companyData of companies) {
    // 3.1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: 'ashby',
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
        jobBoardId: ashbyBoard.id,
        companyId: company.id,
      },
    });

    if (!existingRelation) {
      await jbcRepo.save({
        jobBoardId: ashbyBoard.id,
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
  console.log('\n✅ Seed Ashby concluído!');
}
