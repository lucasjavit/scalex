/**
 * Lista curada de empresas que têm perfis no Built In
 * URLs e Company IDs verificados
 */

export interface BuiltInCompany {
  companyId: number;
  slug: string;
  name: string;
  description?: string;
}

/**
 * Empresas verificadas com páginas públicas no Built In
 *
 * Built In URL Pattern: https://builtin.com/company/COMPANY
 * Jobs API: https://builtin.com/jobs?companyId=COMPANY_ID&remote=true
 *
 * Para encontrar company IDs:
 * 1. Acesse https://builtin.com/company/COMPANY_SLUG
 * 2. Veja o source da página
 * 3. Procure por "companyId" no código JavaScript
 */
const BUILTIN_COMPANIES: BuiltInCompany[] = [
  // Grandes Tech Companies
  {
    companyId: 84805,
    slug: 'stripe',
    name: 'Stripe',
    description: 'Payment infrastructure',
  },
  {
    companyId: 25746,
    slug: 'airbnb',
    name: 'Airbnb',
    description: 'Vacation rentals and experiences',
  },
  {
    companyId: 51527,
    slug: 'coinbase',
    name: 'Coinbase',
    description: 'Cryptocurrency exchange',
  },
  {
    companyId: 66398,
    slug: 'notion',
    name: 'Notion',
    description: 'Productivity and note-taking',
  },
  {
    companyId: 81886,
    slug: 'figma',
    name: 'Figma',
    description: 'Design and prototyping',
  },

  // FinTech
  {
    companyId: 63644,
    slug: 'chime',
    name: 'Chime',
    description: 'Mobile banking',
  },
  {
    companyId: 38876,
    slug: 'robinhood',
    name: 'Robinhood',
    description: 'Stock trading app',
  },
  {
    companyId: 31849,
    slug: 'square',
    name: 'Square',
    description: 'Payment processing',
  },

  // AI/ML
  {
    companyId: 46735,
    slug: 'openai',
    name: 'OpenAI',
    description: 'AI research and deployment',
  },

  // SaaS
  {
    companyId: 37878,
    slug: 'airtable',
    name: 'Airtable',
    description: 'Collaborative database',
  },
  {
    companyId: 84953,
    slug: 'miro',
    name: 'Miro',
    description: 'Online whiteboard',
  },
  {
    companyId: 38133,
    slug: 'canva',
    name: 'Canva',
    description: 'Graphic design platform',
  },
  {
    companyId: 69698,
    slug: 'webflow',
    name: 'Webflow',
    description: 'No-code website builder',
  },
  {
    companyId: 16914,
    slug: 'zapier',
    name: 'Zapier',
    description: 'Automation platform',
  },

  // Developer Tools
  {
    companyId: 25817,
    slug: 'github',
    name: 'GitHub',
    description: 'Code hosting platform',
  },
  {
    companyId: 38479,
    slug: 'gitlab',
    name: 'GitLab',
    description: 'DevOps platform',
  },
  {
    companyId: 26109,
    slug: 'datadog',
    name: 'Datadog',
    description: 'Monitoring and analytics',
  },
  {
    companyId: 54312,
    slug: 'postman',
    name: 'Postman',
    description: 'API development',
  },

  // Remote-First Companies
  {
    companyId: 16965,
    slug: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'Privacy-focused search',
  },
  {
    companyId: 24886,
    slug: 'automattic',
    name: 'Automattic',
    description: 'WordPress.com',
  },
  {
    companyId: 24887,
    slug: 'buffer',
    name: 'Buffer',
    description: 'Social media management',
  },
  {
    companyId: 24948,
    slug: 'toptal',
    name: 'Toptal',
    description: 'Freelance talent network',
  },

  // E-commerce & Retail Tech
  {
    companyId: 21448,
    slug: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform',
  },
  {
    companyId: 84997,
    slug: 'instacart',
    name: 'Instacart',
    description: 'Grocery delivery',
  },

  // Cloud & Infrastructure
  {
    companyId: 85053,
    slug: 'snowflake',
    name: 'Snowflake',
    description: 'Data warehouse',
  },
];

/**
 * Retorna lista de empresas verificadas
 */
export function getVerifiedBuiltInCompanies(): BuiltInCompany[] {
  return BUILTIN_COMPANIES;
}

/**
 * Busca empresa por slug
 */
export function getBuiltInCompanyBySlug(
  slug: string,
): BuiltInCompany | undefined {
  return BUILTIN_COMPANIES.find((c) => c.slug === slug);
}

/**
 * Busca empresa por company ID
 */
export function getBuiltInCompanyById(
  companyId: number,
): BuiltInCompany | undefined {
  return BUILTIN_COMPANIES.find((c) => c.companyId === companyId);
}
