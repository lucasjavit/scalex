/**
 * Lista curada de empresas que usam Lever.co
 * URLs verificadas e funcionais
 */

export interface LeverCompany {
  slug: string;
  name: string;
  description?: string;
}

/**
 * Empresas verificadas que usam Lever e têm vagas públicas
 */
const LEVER_COMPANIES: LeverCompany[] = [
  // Tech Giants
  { slug: 'netflix', name: 'Netflix', description: 'Streaming entertainment' },
  { slug: 'uber', name: 'Uber', description: 'Ride-sharing & delivery' },
  { slug: 'lever', name: 'Lever', description: 'Recruiting software (Lever itself)' },

  // Crypto/Web3
  { slug: 'coinbase', name: 'Coinbase', description: 'Cryptocurrency exchange' },
  { slug: 'binance', name: 'Binance', description: 'Largest crypto exchange' },
  { slug: 'kraken', name: 'Kraken', description: 'Crypto exchange' },
  { slug: 'gemini', name: 'Gemini', description: 'Crypto platform' },
  { slug: 'circle', name: 'Circle', description: 'Digital currency company' },
  { slug: 'chainalysis', name: 'Chainalysis', description: 'Blockchain data platform' },

  // FinTech
  { slug: 'stripe', name: 'Stripe', description: 'Payment infrastructure' },

  // LATAM Companies
  { slug: 'yuno', name: 'Yuno', description: 'Payments orchestration LATAM' },
  { slug: 'payclip', name: 'Clip', description: 'Mexican fintech' },
  { slug: 'kavak', name: 'Kavak', description: 'Used cars marketplace LATAM' },
  { slug: 'bitso', name: 'Bitso', description: 'Crypto exchange LATAM' },
  { slug: 'kushki', name: 'Kushki', description: 'Payment infrastructure LATAM' },
  { slug: 'rappi', name: 'Rappi', description: 'Delivery app LATAM' },

  // Social/Communication
  { slug: 'reddit', name: 'Reddit', description: 'Social news platform' },
  { slug: 'duolingo', name: 'Duolingo', description: 'Language learning' },

  // Data/Analytics
  { slug: 'databricks', name: 'Databricks', description: 'Data & AI platform' },
  { slug: 'snowflake', name: 'Snowflake', description: 'Cloud data platform' },
  { slug: 'mongodb', name: 'MongoDB', description: 'Database platform' },
  { slug: 'elastic', name: 'Elastic', description: 'Search & observability' },
  { slug: 'datadog', name: 'Datadog', description: 'Monitoring & analytics' },

  // Dev Tools
  { slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
  { slug: 'figma', name: 'Figma', description: 'Design collaboration' },

  // Design/Creative
  { slug: 'canva', name: 'Canva', description: 'Graphic design platform' },
  { slug: 'notion', name: 'Notion', description: 'Productivity workspace' },

  // Additional Tech Companies
  { slug: 'connectly', name: 'Connectly', description: 'Customer engagement' },
  { slug: 'workato', name: 'Workato', description: 'Integration platform' },
  { slug: 'miro', name: 'Miro', description: 'Online whiteboard' },
  { slug: 'grammarly', name: 'Grammarly', description: 'Writing assistant' },
  { slug: 'loom', name: 'Loom', description: 'Video messaging' },
  { slug: 'airtable', name: 'Airtable', description: 'Collaborative database' },
  { slug: 'segment', name: 'Segment', description: 'Customer data platform' },
  { slug: 'amplitude', name: 'Amplitude', description: 'Product analytics' },
  { slug: 'plaid', name: 'Plaid', description: 'Financial data network' },
  { slug: 'brex', name: 'Brex', description: 'Corporate credit card' },
  { slug: 'ramp', name: 'Ramp', description: 'Finance automation' },
  { slug: 'hashicorp', name: 'HashiCorp', description: 'Cloud infrastructure' },
  { slug: 'vercel', name: 'Vercel', description: 'Frontend cloud' },
  { slug: 'netlify', name: 'Netlify', description: 'Web platform' },
  { slug: 'render', name: 'Render', description: 'Cloud platform' },
  { slug: 'fly', name: 'Fly.io', description: 'Edge platform' },
];

/**
 * Retorna lista de empresas verificadas
 */
export function getVerifiedLeverCompanies(): LeverCompany[] {
  return LEVER_COMPANIES;
}

/**
 * Busca empresa por slug
 */
export function getLeverCompanyBySlug(slug: string): LeverCompany | undefined {
  return LEVER_COMPANIES.find((c) => c.slug === slug);
}
