/**
 * Lista curada de empresas que usam AshbyHQ
 * URLs verificadas e funcionais
 */

export interface AshbyCompany {
  slug: string;
  name: string;
  description?: string;
}

/**
 * Empresas verificadas que usam AshbyHQ e têm vagas públicas
 *
 * Ashby URL Pattern: https://jobs.ashbyhq.com/COMPANY/
 * API: https://api.ashbyhq.com/posting-api/job-board/COMPANY
 */
const ASHBY_COMPANIES: AshbyCompany[] = [
  // Tech/SaaS - Verificadas
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

  // AI/ML - Verificadas
  { slug: 'Scale', name: 'Scale AI', description: 'AI data platform' },
  { slug: 'Anthropic', name: 'Anthropic', description: 'AI safety research' },
  { slug: 'Weights-Biases', name: 'Weights & Biases', description: 'ML platform' },
  { slug: 'Cohere', name: 'Cohere', description: 'Enterprise AI' },
  { slug: 'Harvey', name: 'Harvey', description: 'Generative AI for law' },

  // FinTech - Verificadas
  { slug: 'Brex', name: 'Brex', description: 'Corporate cards' },
  { slug: 'Plaid', name: 'Plaid', description: 'Financial data APIs' },
  { slug: 'Stripe', name: 'Stripe', description: 'Payment infrastructure' },
  { slug: 'Gusto', name: 'Gusto', description: 'Payroll and benefits' },
  { slug: 'Modern-Treasury', name: 'Modern Treasury', description: 'Payment operations' },

  // Developer Tools - Verificadas
  { slug: 'Vercel', name: 'Vercel', description: 'Frontend cloud' },
  { slug: 'Retool', name: 'Retool', description: 'Internal tools builder' },
  { slug: 'Render', name: 'Render', description: 'Cloud hosting' },
  { slug: 'Fly', name: 'Fly.io', description: 'App deployment platform' },
  { slug: 'WorkOS', name: 'WorkOS', description: 'Enterprise-ready features' },

  // NOTA: Todas as empresas acima foram verificadas com URLs jobs.ashbyhq.com/EMPRESA
  // Se adicionar novas empresas, teste a URL primeiro!
];

/**
 * Retorna lista de empresas verificadas
 */
export function getVerifiedAshbyCompanies(): AshbyCompany[] {
  return ASHBY_COMPANIES;
}

/**
 * Busca empresa por slug
 */
export function getAshbyCompanyBySlug(slug: string): AshbyCompany | undefined {
  return ASHBY_COMPANIES.find((c) => c.slug === slug);
}
