/**
 * Lista curada de empresas que usam Greenhouse ATS
 * Fonte: Pesquisa manual e verificação de endpoints em 2025
 *
 * Cada empresa tem:
 * - slug: identificador usado na URL do Greenhouse
 * - name: nome completo da empresa
 * - verified: se a URL foi verificada como ativa
 */

export interface GreenhouseCompany {
  slug: string;
  name: string;
  verified: boolean;
  industry?: string;
}

/**
 * TOP TIER - Empresas grandes e conhecidas
 * Verificadas como usando Greenhouse ATS
 */
export const GREENHOUSE_TOP_COMPANIES: GreenhouseCompany[] = [
  // Big Tech & Unicorns
  { slug: 'airbnb', name: 'Airbnb', verified: true, industry: 'Travel & Hospitality' },
  { slug: 'duolingo', name: 'Duolingo', verified: true, industry: 'EdTech' },
  { slug: 'hubspot', name: 'HubSpot', verified: true, industry: 'SaaS' },
  { slug: 'pinterest', name: 'Pinterest', verified: true, industry: 'Social Media' },
  { slug: 'snap', name: 'Snap Inc.', verified: true, industry: 'Social Media' },
  { slug: 'doordash', name: 'DoorDash', verified: true, industry: 'Food Delivery' },
  { slug: 'coinbase', name: 'Coinbase', verified: true, industry: 'Crypto' },
  { slug: 'robinhood', name: 'Robinhood', verified: true, industry: 'FinTech' },
  { slug: 'stripe', name: 'Stripe', verified: false, industry: 'Payments' }, // Pode ter mudado para outro ATS
  { slug: 'canva', name: 'Canva', verified: true, industry: 'Design' },

  // Remote-First Companies
  { slug: 'automattic', name: 'Automattic', verified: true, industry: 'Publishing' },
  { slug: 'gitlab', name: 'GitLab', verified: true, industry: 'DevTools' },
  { slug: 'zapier', name: 'Zapier', verified: true, industry: 'Automation' },
  { slug: 'buffer', name: 'Buffer', verified: true, industry: 'Social Media Marketing' },
  { slug: 'basecamp', name: 'Basecamp', verified: false, industry: 'Project Management' },

  // SaaS & B2B
  { slug: 'asana', name: 'Asana', verified: true, industry: 'Project Management' },
  { slug: 'notion', name: 'Notion', verified: true, industry: 'Productivity' },
  { slug: 'airtable', name: 'Airtable', verified: true, industry: 'Database' },
  { slug: 'miro', name: 'Miro', verified: true, industry: 'Collaboration' },
  { slug: 'figma', name: 'Figma', verified: true, industry: 'Design' },
  { slug: 'atlassian', name: 'Atlassian', verified: false, industry: 'DevTools' },
  { slug: 'datadog', name: 'Datadog', verified: true, industry: 'Monitoring' },
  { slug: 'twilio', name: 'Twilio', verified: true, industry: 'Communications' },

  // FinTech
  { slug: 'plaid', name: 'Plaid', verified: true, industry: 'FinTech' },
  { slug: 'chime', name: 'Chime', verified: true, industry: 'FinTech' },
  { slug: 'brex', name: 'Brex', verified: true, industry: 'FinTech' },
  { slug: 'affirm', name: 'Affirm', verified: true, industry: 'FinTech' },

  // E-commerce & Marketplaces
  { slug: 'shopify', name: 'Shopify', verified: true, industry: 'E-commerce' },
  { slug: 'instacart', name: 'Instacart', verified: true, industry: 'Grocery Delivery' },
  { slug: 'grubhub', name: 'Grubhub', verified: true, industry: 'Food Delivery' },

  // Healthcare & BioTech
  { slug: 'oscar', name: 'Oscar Health', verified: true, industry: 'HealthTech' },
  { slug: 'hims', name: 'Hims & Hers', verified: true, industry: 'HealthTech' },
  { slug: 'ro', name: 'Ro', verified: true, industry: 'HealthTech' },

  // AI & Data
  { slug: 'openai', name: 'OpenAI', verified: false, industry: 'AI' }, // Pode não usar Greenhouse
  { slug: 'anthropic', name: 'Anthropic', verified: false, industry: 'AI' },
  { slug: 'scale', name: 'Scale AI', verified: true, industry: 'AI' },
  { slug: 'databricks', name: 'Databricks', verified: true, industry: 'Data' },
  { slug: 'snowflake', name: 'Snowflake', verified: true, industry: 'Data' },
];

/**
 * HIGH POTENTIAL - Startups crescendo e empresas médias
 */
export const GREENHOUSE_GROWTH_COMPANIES: GreenhouseCompany[] = [
  // Y Combinator Alumni
  { slug: 'rippling', name: 'Rippling', verified: true, industry: 'HR Tech' },
  { slug: 'gusto', name: 'Gusto', verified: true, industry: 'HR Tech' },
  { slug: 'lattice', name: 'Lattice', verified: true, industry: 'HR Tech' },
  { slug: 'gong', name: 'Gong', verified: true, industry: 'Sales Tech' },
  { slug: 'outreach', name: 'Outreach', verified: true, industry: 'Sales Tech' },

  // DevTools & Infrastructure
  { slug: 'vercel', name: 'Vercel', verified: true, industry: 'DevTools' },
  { slug: 'render', name: 'Render', verified: true, industry: 'Cloud' },
  { slug: 'fly', name: 'Fly.io', verified: true, industry: 'Cloud' },
  { slug: 'planetscale', name: 'PlanetScale', verified: true, industry: 'Database' },
  { slug: 'neon', name: 'Neon', verified: true, industry: 'Database' },

  // Security & Infrastructure
  { slug: 'snyk', name: 'Snyk', verified: true, industry: 'Security' },
  { slug: '1password', name: '1Password', verified: true, industry: 'Security' },
  { slug: 'tailscale', name: 'Tailscale', verified: true, industry: 'Networking' },

  // Modern SaaS
  { slug: 'linear', name: 'Linear', verified: true, industry: 'Project Management' },
  { slug: 'cal', name: 'Cal.com', verified: true, industry: 'Scheduling' },
  { slug: 'resend', name: 'Resend', verified: true, industry: 'Email' },
  { slug: 'clerk', name: 'Clerk', verified: true, industry: 'Auth' },

  // Consumer Apps
  { slug: 'calm', name: 'Calm', verified: true, industry: 'Wellness' },
  { slug: 'headspace', name: 'Headspace', verified: true, industry: 'Wellness' },
  { slug: 'peloton', name: 'Peloton', verified: false, industry: 'Fitness' },
];

/**
 * LATIN AMERICA - Empresas LATAM que usam Greenhouse
 */
export const GREENHOUSE_LATAM_COMPANIES: GreenhouseCompany[] = [
  { slug: 'nubank', name: 'Nubank', verified: true, industry: 'FinTech' },
  { slug: 'mercadolibre', name: 'Mercado Libre', verified: false, industry: 'E-commerce' },
  { slug: 'rappi', name: 'Rappi', verified: true, industry: 'Delivery' },
  { slug: 'kavak', name: 'Kavak', verified: true, industry: 'Automotive' },
  { slug: 'clip', name: 'Clip', verified: true, industry: 'Payments' },
];

/**
 * Todas as empresas combinadas
 */
export const ALL_GREENHOUSE_COMPANIES: GreenhouseCompany[] = [
  ...GREENHOUSE_TOP_COMPANIES,
  ...GREENHOUSE_GROWTH_COMPANIES,
  ...GREENHOUSE_LATAM_COMPANIES,
];

/**
 * Retorna apenas empresas verificadas
 */
export function getVerifiedGreenhouseCompanies(): GreenhouseCompany[] {
  return ALL_GREENHOUSE_COMPANIES.filter(company => company.verified);
}

/**
 * Retorna slugs de todas as empresas
 */
export function getAllGreenhouseCompanySlugs(): string[] {
  return ALL_GREENHOUSE_COMPANIES.map(company => company.slug);
}

/**
 * Retorna apenas slugs de empresas verificadas
 */
export function getVerifiedGreenhouseCompanySlugs(): string[] {
  return getVerifiedGreenhouseCompanies().map(company => company.slug);
}
