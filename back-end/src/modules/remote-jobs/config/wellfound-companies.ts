/**
 * Lista curada de empresas que usam Wellfound (AngelList Talent)
 * URLs verificadas e funcionais
 */

export interface WellfoundCompany {
  slug: string;
  name: string;
  description?: string;
}

/**
 * Empresas verificadas que têm páginas públicas no Wellfound
 *
 * Wellfound URL Pattern: https://wellfound.com/company/COMPANY
 * Note: Wellfound não tem API pública, dados são extraídos do __NEXT_DATA__ no HTML
 */
const WELLFOUND_COMPANIES: WellfoundCompany[] = [
  // Grandes Tech Companies
  { slug: 'stripe', name: 'Stripe', description: 'Payment infrastructure' },
  { slug: 'airbnb', name: 'Airbnb', description: 'Vacation rentals and experiences' },
  { slug: 'coinbase', name: 'Coinbase', description: 'Cryptocurrency exchange' },
  { slug: 'notion', name: 'Notion', description: 'Productivity and note-taking' },
  { slug: 'figma', name: 'Figma', description: 'Design and prototyping' },

  // FinTech
  { slug: 'chime', name: 'Chime', description: 'Mobile banking' },
  { slug: 'robinhood', name: 'Robinhood', description: 'Stock trading app' },
  { slug: 'square', name: 'Square', description: 'Payment processing' },

  // AI/ML
  { slug: 'openai', name: 'OpenAI', description: 'AI research and deployment' },
  { slug: 'hugging-face', name: 'Hugging Face', description: 'AI model hub' },

  // SaaS
  { slug: 'airtable', name: 'Airtable', description: 'Collaborative database' },
  { slug: 'miro', name: 'Miro', description: 'Online whiteboard' },
  { slug: 'canva', name: 'Canva', description: 'Graphic design platform' },
  { slug: 'webflow', name: 'Webflow', description: 'No-code website builder' },
  { slug: 'zapier', name: 'Zapier', description: 'Automation platform' },

  // Developer Tools
  { slug: 'github', name: 'GitHub', description: 'Code hosting platform' },
  { slug: 'gitlab', name: 'GitLab', description: 'DevOps platform' },
  { slug: 'datadog', name: 'Datadog', description: 'Monitoring and analytics' },
  { slug: 'postman', name: 'Postman', description: 'API development' },

  // Remote-First Companies
  { slug: 'gitlab-1', name: 'GitLab', description: 'All-remote company' },
  { slug: 'duckduckgo', name: 'DuckDuckGo', description: 'Privacy-focused search' },
  { slug: 'automattic', name: 'Automattic', description: 'WordPress.com' },
  { slug: 'buffer', name: 'Buffer', description: 'Social media management' },
  { slug: 'zapier-1', name: 'Zapier', description: 'Remote-first automation' },
  { slug: 'toptal', name: 'Toptal', description: 'Freelance talent network' },
];

/**
 * Retorna lista de empresas verificadas
 */
export function getVerifiedWellfoundCompanies(): WellfoundCompany[] {
  return WELLFOUND_COMPANIES;
}

/**
 * Busca empresa por slug
 */
export function getWellfoundCompanyBySlug(
  slug: string,
): WellfoundCompany | undefined {
  return WELLFOUND_COMPANIES.find((c) => c.slug === slug);
}
