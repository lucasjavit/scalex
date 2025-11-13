import { DataSource } from 'typeorm';

/**
 * Seed com 93 empresas tech populares conhecidas por contratar remotamente
 * Inclui empresas globais e latino-americanas (Nubank, Rappi, Kavak, Clip, Bitso, etc)
 * Essas empresas usam Lever ou Greenhouse como plataforma de ATS
 */

interface CompanyData {
  slug: string;
  name: string;
  platform: 'lever' | 'greenhouse' | 'ashby' | 'workable';
  website?: string;
  logo?: string;
}

const POPULAR_COMPANIES: CompanyData[] = [
  // Lever Companies - Tech Giants e Unicorns
  { slug: 'affirm', name: 'Affirm', platform: 'lever', website: 'https://www.affirm.com' },
  { slug: 'airtable', name: 'Airtable', platform: 'lever', website: 'https://www.airtable.com' },
  { slug: 'binance', name: 'Binance', platform: 'lever', website: 'https://www.binance.com' },
  { slug: 'bitso', name: 'Bitso', platform: 'lever', website: 'https://bitso.com' },
  { slug: 'buffer', name: 'Buffer', platform: 'lever', website: 'https://buffer.com' },
  { slug: 'calendly', name: 'Calendly', platform: 'lever', website: 'https://calendly.com' },
  { slug: 'canva', name: 'Canva', platform: 'lever', website: 'https://www.canva.com' },
  { slug: 'chainalysis', name: 'Chainalysis', platform: 'lever', website: 'https://www.chainalysis.com' },
  { slug: 'circle', name: 'Circle', platform: 'lever', website: 'https://www.circle.com' },
  { slug: 'clip', name: 'Clip', platform: 'lever', website: 'https://www.clip.mx' },
  { slug: 'coda', name: 'Coda', platform: 'lever', website: 'https://coda.io' },
  { slug: 'coinbase', name: 'Coinbase', platform: 'lever', website: 'https://www.coinbase.com' },
  { slug: 'connectly', name: 'Connectly', platform: 'lever', website: 'https://www.connectly.ai' },
  { slug: 'databricks', name: 'Databricks', platform: 'lever', website: 'https://www.databricks.com' },
  { slug: 'datadog', name: 'Datadog', platform: 'lever', website: 'https://www.datadoghq.com' },
  { slug: 'discord', name: 'Discord', platform: 'lever', website: 'https://discord.com' },
  { slug: 'duckduckgo', name: 'DuckDuckGo', platform: 'lever', website: 'https://duckduckgo.com' },
  { slug: 'duolingo', name: 'Duolingo', platform: 'lever', website: 'https://www.duolingo.com' },
  { slug: 'elastic', name: 'Elastic', platform: 'lever', website: 'https://www.elastic.co' },
  { slug: 'figma', name: 'Figma', platform: 'lever', website: 'https://www.figma.com' },
  { slug: 'gemini', name: 'Gemini', platform: 'lever', website: 'https://www.gemini.com' },
  { slug: 'gitlab', name: 'GitLab', platform: 'lever', website: 'https://about.gitlab.com' },
  { slug: 'grammarly', name: 'Grammarly', platform: 'lever', website: 'https://www.grammarly.com' },
  { slug: 'huggingface', name: 'Hugging Face', platform: 'lever', website: 'https://huggingface.co' },
  { slug: 'invision', name: 'InVision', platform: 'lever', website: 'https://www.invisionapp.com' },
  { slug: 'jetbrains', name: 'JetBrains', platform: 'lever', website: 'https://www.jetbrains.com' },
  { slug: 'kavak', name: 'Kavak', platform: 'lever', website: 'https://www.kavak.com' },
  { slug: 'kraken', name: 'Kraken', platform: 'lever', website: 'https://www.kraken.com' },
  { slug: 'kushki', name: 'Kushki', platform: 'lever', website: 'https://www.kushkipagos.com' },
  { slug: 'linear', name: 'Linear', platform: 'lever', website: 'https://linear.app' },
  { slug: 'loom', name: 'Loom', platform: 'lever', website: 'https://www.loom.com' },
  { slug: 'medium', name: 'Medium', platform: 'lever', website: 'https://medium.com' },
  { slug: 'miro', name: 'Miro', platform: 'lever', website: 'https://miro.com' },
  { slug: 'mongodb', name: 'MongoDB', platform: 'lever', website: 'https://www.mongodb.com' },
  { slug: 'netflix', name: 'Netflix', platform: 'lever', website: 'https://www.netflix.com' },
  { slug: 'notion', name: 'Notion', platform: 'lever', website: 'https://www.notion.so' },
  { slug: 'plaid', name: 'Plaid', platform: 'lever', website: 'https://plaid.com' },
  { slug: 'reddit', name: 'Reddit', platform: 'lever', website: 'https://www.reddit.com' },
  { slug: 'sketch', name: 'Sketch', platform: 'lever', website: 'https://www.sketch.com' },
  { slug: 'snowflake', name: 'Snowflake', platform: 'lever', website: 'https://www.snowflake.com' },
  { slug: 'stripe', name: 'Stripe', platform: 'lever', website: 'https://stripe.com' },
  { slug: 'substack', name: 'Substack', platform: 'lever', website: 'https://substack.com' },
  { slug: 'uber', name: 'Uber', platform: 'lever', website: 'https://www.uber.com' },
  { slug: 'vercel', name: 'Vercel', platform: 'lever', website: 'https://vercel.com' },
  { slug: 'webflow', name: 'Webflow', platform: 'lever', website: 'https://webflow.com' },
  { slug: 'yuno', name: 'Yuno', platform: 'lever', website: 'https://www.y.uno' },

  // Greenhouse Companies - Enterprise & Scale-ups
  { slug: 'airbnb', name: 'Airbnb', platform: 'greenhouse', website: 'https://www.airbnb.com' },
  { slug: 'anthropic', name: 'Anthropic', platform: 'greenhouse', website: 'https://www.anthropic.com' },
  { slug: 'asana', name: 'Asana', platform: 'greenhouse', website: 'https://asana.com' },
  { slug: 'atlassian', name: 'Atlassian', platform: 'greenhouse', website: 'https://www.atlassian.com' },
  { slug: 'automattic', name: 'Automattic', platform: 'greenhouse', website: 'https://automattic.com' },
  { slug: 'basecamp', name: 'Basecamp', platform: 'greenhouse', website: 'https://basecamp.com' },
  { slug: 'brex', name: 'Brex', platform: 'greenhouse', website: 'https://www.brex.com' },
  { slug: 'calm', name: 'Calm', platform: 'greenhouse', website: 'https://www.calm.com' },
  { slug: 'chime', name: 'Chime', platform: 'greenhouse', website: 'https://www.chime.com' },
  { slug: 'cloudflare', name: 'Cloudflare', platform: 'greenhouse', website: 'https://www.cloudflare.com' },
  { slug: 'coursera', name: 'Coursera', platform: 'greenhouse', website: 'https://www.coursera.org' },
  { slug: 'deel', name: 'Deel', platform: 'greenhouse', website: 'https://www.deel.com' },
  { slug: 'docker', name: 'Docker', platform: 'greenhouse', website: 'https://www.docker.com' },
  { slug: 'doordash', name: 'DoorDash', platform: 'greenhouse', website: 'https://www.doordash.com' },
  { slug: 'dropbox', name: 'Dropbox', platform: 'greenhouse', website: 'https://www.dropbox.com' },
  { slug: 'etsy', name: 'Etsy', platform: 'greenhouse', website: 'https://www.etsy.com' },
  { slug: 'faire', name: 'Faire', platform: 'greenhouse', website: 'https://www.faire.com' },
  { slug: 'github', name: 'GitHub', platform: 'greenhouse', website: 'https://github.com' },
  { slug: 'gympass', name: 'Gympass', platform: 'greenhouse', website: 'https://www.gympass.com' },
  { slug: 'hashicorp', name: 'HashiCorp', platform: 'greenhouse', website: 'https://www.hashicorp.com' },
  { slug: 'headspace', name: 'Headspace', platform: 'greenhouse', website: 'https://www.headspace.com' },
  { slug: 'hubspot', name: 'HubSpot', platform: 'greenhouse', website: 'https://www.hubspot.com' },
  { slug: 'instacart', name: 'Instacart', platform: 'greenhouse', website: 'https://www.instacart.com' },
  { slug: 'lyft', name: 'Lyft', platform: 'greenhouse', website: 'https://www.lyft.com' },
  { slug: 'marqeta', name: 'Marqeta', platform: 'greenhouse', website: 'https://www.marqeta.com' },
  { slug: 'nubank', name: 'Nubank', platform: 'greenhouse', website: 'https://nubank.com.br' },
  { slug: 'openai', name: 'OpenAI', platform: 'greenhouse', website: 'https://openai.com' },
  { slug: 'oscar', name: 'Oscar Health', platform: 'greenhouse', website: 'https://www.hioscar.com' },
  { slug: 'pinterest', name: 'Pinterest', platform: 'greenhouse', website: 'https://www.pinterest.com' },
  { slug: 'poshmark', name: 'Poshmark', platform: 'greenhouse', website: 'https://poshmark.com' },
  { slug: 'ramp', name: 'Ramp', platform: 'greenhouse', website: 'https://ramp.com' },
  { slug: 'rappi', name: 'Rappi', platform: 'greenhouse', website: 'https://www.rappi.com' },
  { slug: 'remote', name: 'Remote.com', platform: 'greenhouse', website: 'https://remote.com' },
  { slug: 'robinhood', name: 'Robinhood', platform: 'greenhouse', website: 'https://robinhood.com' },
  { slug: 'scale', name: 'Scale AI', platform: 'greenhouse', website: 'https://scale.com' },
  { slug: 'shopify', name: 'Shopify', platform: 'greenhouse', website: 'https://www.shopify.com' },
  { slug: 'slack', name: 'Slack', platform: 'greenhouse', website: 'https://slack.com' },
  { slug: 'spotify', name: 'Spotify', platform: 'greenhouse', website: 'https://www.spotify.com' },
  { slug: 'square', name: 'Square', platform: 'greenhouse', website: 'https://squareup.com' },
  { slug: 'toptal', name: 'Toptal', platform: 'greenhouse', website: 'https://www.toptal.com' },
  { slug: 'twilio', name: 'Twilio', platform: 'greenhouse', website: 'https://www.twilio.com' },
  { slug: 'udemy', name: 'Udemy', platform: 'greenhouse', website: 'https://www.udemy.com' },
  { slug: 'wildlife', name: 'Wildlife Studios', platform: 'greenhouse', website: 'https://www.wildlifestudios.com' },
  { slug: 'wise', name: 'Wise', platform: 'greenhouse', website: 'https://wise.com' },
  { slug: 'zapier', name: 'Zapier', platform: 'greenhouse', website: 'https://zapier.com' },
  { slug: 'zendesk', name: 'Zendesk', platform: 'greenhouse', website: 'https://www.zendesk.com' },
  { slug: 'zoom', name: 'Zoom', platform: 'greenhouse', website: 'https://zoom.us' },
];

export async function seedPopularCompanies(dataSource: DataSource) {
  const companyRepo = dataSource.getRepository('companies');
  const jobBoardRepo = dataSource.getRepository('job_boards');
  const jbcRepo = dataSource.getRepository('job_board_companies');

  console.log('🌱 Iniciando seed de empresas populares...');
  console.log(`📋 ${POPULAR_COMPANIES.length} empresas tech globais e latino-americanas`);

  let createdCompanies = 0;
  let existingCompanies = 0;
  let createdRelations = 0;

  for (const companyData of POPULAR_COMPANIES) {
    // 1. Criar/buscar a company
    let company = await companyRepo.findOne({
      where: { slug: companyData.slug },
    });

    if (!company) {
      company = await companyRepo.save({
        slug: companyData.slug,
        name: companyData.name,
        platform: companyData.platform,
        website: companyData.website,
        featured: false,
        featuredOrder: 0,
        rating: 0,
        reviewCount: 0,
        totalJobs: 0,
      });
      createdCompanies++;
      console.log(`  ✅ ${companyData.name} (${companyData.platform})`);
    } else {
      existingCompanies++;
    }

    // 2. Buscar o job board correspondente
    const jobBoard = await jobBoardRepo.findOne({
      where: { slug: companyData.platform },
    });

    if (jobBoard) {
      // 3. Criar relação job_board_companies se não existir
      const existingRelation = await jbcRepo.findOne({
        where: {
          jobBoardId: jobBoard.id,
          companyId: company.id,
        },
      });

      if (!existingRelation) {
        let scraperUrl = '';

        switch (companyData.platform) {
          case 'lever':
            scraperUrl = `https://api.lever.co/v0/postings/${companyData.slug}`;
            break;
          case 'greenhouse':
            scraperUrl = `https://boards-api.greenhouse.io/v1/boards/${companyData.slug}/jobs`;
            break;
          case 'ashby':
            scraperUrl = `https://jobs.ashbyhq.com/${companyData.slug}`;
            break;
          case 'workable':
            scraperUrl = `https://apply.workable.com/${companyData.slug}`;
            break;
        }

        await jbcRepo.save({
          jobBoardId: jobBoard.id,
          companyId: company.id,
          scraperUrl,
          enabled: true,
          scrapingStatus: null,
          lastScrapedAt: null,
          errorMessage: null,
        });
        createdRelations++;
      }
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`  • Empresas criadas: ${createdCompanies}`);
  console.log(`  • Empresas já existentes: ${existingCompanies}`);
  console.log(`  • Relações criadas: ${createdRelations}`);
  console.log('\n✅ Seed de empresas populares concluído!');
}
