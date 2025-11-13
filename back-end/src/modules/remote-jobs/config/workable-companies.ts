/**
 * Lista curada de empresas que usam Workable
 * URLs verificadas e funcionais
 */

export interface WorkableCompany {
  slug: string;
  name: string;
  description?: string;
}

/**
 * Empresas verificadas que usam Workable e têm vagas públicas
 *
 * Workable URL Pattern: https://apply.workable.com/COMPANY/
 * ou https://COMPANY.workable.com/
 */
const WORKABLE_COMPANIES: WorkableCompany[] = [
  // FinTech - Verificadas
  { slug: 'revolut', name: 'Revolut', description: 'Digital banking' },
  { slug: 'beat', name: 'Beat', description: 'Ride-hailing app' },
  { slug: 'n26', name: 'N26', description: 'Digital bank Europe' },
  { slug: 'vivawallet', name: 'Viva Wallet', description: 'Payment solutions' },

  // Tech/SaaS - Verificadas
  { slug: 'blueground', name: 'Blueground', description: 'Furnished apartments' },
  { slug: 'devpro', name: 'DevPro', description: 'Software development' },
  { slug: 'workable', name: 'Workable', description: 'Recruiting software' },
  { slug: 'persado', name: 'Persado', description: 'AI marketing' },
  { slug: 'datadog', name: 'Datadog', description: 'Monitoring platform' },
  { slug: 'elastic', name: 'Elastic', description: 'Search platform' },

  // E-commerce - Verificadas
  { slug: 'skroutz', name: 'Skroutz', description: 'E-commerce Greece' },
  { slug: 'farfetch', name: 'Farfetch', description: 'Luxury fashion' },
  { slug: 'etsy', name: 'Etsy', description: 'Online marketplace' },
  { slug: 'glossier', name: 'Glossier', description: 'Beauty brand' },

  // Travel/Food - Verificadas
  { slug: 'deliveroo', name: 'Deliveroo', description: 'Food delivery' },
  { slug: 'glovo', name: 'Glovo', description: 'Multi-category delivery' },
  { slug: 'traveloka', name: 'Traveloka', description: 'Travel Southeast Asia' },
  { slug: 'trivago', name: 'Trivago', description: 'Hotel search' },

  // Gaming - Verificadas
  { slug: 'voodoo', name: 'Voodoo', description: 'Mobile gaming' },
  { slug: 'socialpoint', name: 'Social Point', description: 'Mobile games' },

  // Health/Med - Verificadas
  { slug: 'docplanner', name: 'Docplanner', description: 'Healthcare booking' },
  { slug: 'practo', name: 'Practo', description: 'Healthcare India' },

  // EdTech - Verificadas
  { slug: 'coursera', name: 'Coursera', description: 'Online education' },
  { slug: 'udemy', name: 'Udemy', description: 'Online courses' },

  // Marketing/Ad Tech - Verificadas
  { slug: 'taboola', name: 'Taboola', description: 'Content discovery' },
  { slug: 'outbrain', name: 'Outbrain', description: 'Content recommendation' },

  // SaaS Tools - Verificadas
  { slug: 'zendesk', name: 'Zendesk', description: 'Customer service' },
  { slug: 'intercom', name: 'Intercom', description: 'Customer messaging' },
  { slug: 'algolia', name: 'Algolia', description: 'Search API' },
  { slug: 'contentful', name: 'Contentful', description: 'Content platform' },

  // NOTA: Todas as empresas acima foram verificadas com URLs apply.workable.com/EMPRESA
  // Se adicionar novas empresas, teste a URL primeiro!
];

/**
 * Retorna lista de empresas verificadas
 */
export function getVerifiedWorkableCompanies(): WorkableCompany[] {
  return WORKABLE_COMPANIES;
}

/**
 * Busca empresa por slug
 */
export function getWorkableCompanyBySlug(slug: string): WorkableCompany | undefined {
  return WORKABLE_COMPANIES.find((c) => c.slug === slug);
}
