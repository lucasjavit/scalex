export interface JobBoard {
  slug: string;
  name: string;
  url: string;
  scraper: 'wellfound' | 'builtin' | 'workatastartup' | 'remoterocketship' | 'greenhouse' | 'lever' | 'generic';
  enabled: boolean;
  priority: number; // 1-5, sendo 1 o mais prioritário
}

export const JOB_BOARDS: JobBoard[] = [
  // Tier 1: High-quality remote job boards (Priority 1-2)
  {
    slug: 'wellfound',
    name: 'Wellfound (AngelList)',
    url: 'https://wellfound.com/remote',
    scraper: 'wellfound',
    enabled: true,
    priority: 1,
  },
  {
    slug: 'workatastartup',
    name: 'Y Combinator Work at a Startup',
    url: 'https://www.workatastartup.com/jobs',
    scraper: 'workatastartup',
    enabled: true,
    priority: 1,
  },
  {
    slug: 'builtin',
    name: 'Built In',
    url: 'https://builtin.com/jobs/remote',
    scraper: 'builtin',
    enabled: true,
    priority: 1,
  },
  {
    slug: 'remoterocketship',
    name: 'Remote Rocketship',
    url: 'https://www.remoterocketship.com',
    scraper: 'remoterocketship',
    enabled: true,
    priority: 2,
  },

  // Tier 2: ATS Platforms (já implementado - Priority 2)
  // Nota: Estes são mantidos para empresas featured
  {
    slug: 'lever',
    name: 'Lever Jobs',
    url: 'https://jobs.lever.co',
    scraper: 'lever',
    enabled: true,
    priority: 2,
  },
  {
    slug: 'greenhouse',
    name: 'Greenhouse',
    url: 'https://boards.greenhouse.io',
    scraper: 'greenhouse',
    enabled: false, // TODO: implementar
    priority: 2,
  },

  // Tier 3: ATS/Recruitment platforms (Priority 3)
  {
    slug: 'pinpointhq',
    name: 'Pinpoint',
    url: 'https://pinpointhq.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'breezy',
    name: 'Breezy HR',
    url: 'https://breezy.hr',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'recruitee',
    name: 'Recruitee',
    url: 'https://recruitee.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'teamtailor',
    name: 'Teamtailor',
    url: 'https://teamtailor.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'smartrecruiters',
    name: 'SmartRecruiters',
    url: 'https://smartrecruiters.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'homerun',
    name: 'Homerun',
    url: 'https://homerun.co',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'jobvite',
    name: 'Jobvite',
    url: 'https://jobvite.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },
  {
    slug: 'icims',
    name: 'iCIMS',
    url: 'https://icims.com',
    scraper: 'generic',
    enabled: false,
    priority: 3,
  },

  // Tier 4: HR/Payroll platforms (Priority 4)
  {
    slug: 'rippling',
    name: 'Rippling',
    url: 'https://rippling.com',
    scraper: 'generic',
    enabled: false,
    priority: 4,
  },
  {
    slug: 'gusto',
    name: 'Gusto',
    url: 'https://gusto.com',
    scraper: 'generic',
    enabled: false,
    priority: 4,
  },
  {
    slug: 'adp',
    name: 'ADP',
    url: 'https://www.adp.com',
    scraper: 'generic',
    enabled: false,
    priority: 4,
  },

  // Tier 5: Outros job boards (Priority 5)
  {
    slug: 'glassdoor',
    name: 'Glassdoor',
    url: 'https://www.glassdoor.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'notion',
    name: 'Notion Jobs',
    url: 'https://notion.site',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'dover',
    name: 'Dover',
    url: 'https://dover.io',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'gem',
    name: 'Gem',
    url: 'https://gem.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'trakstar',
    name: 'Trakstar',
    url: 'https://trakstar.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'catsone',
    name: 'CatsOne',
    url: 'https://catsone.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'applytojob',
    name: 'ApplyToJob',
    url: 'https://applytojob.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'careerpuck',
    name: 'CareerPuck',
    url: 'https://careerpuck.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
  {
    slug: 'keka',
    name: 'Keka',
    url: 'https://keka.com',
    scraper: 'generic',
    enabled: false,
    priority: 5,
  },
] as const;

/**
 * Retorna job boards habilitados ordenados por prioridade
 */
export function getEnabledJobBoards(): JobBoard[] {
  return JOB_BOARDS.filter((board) => board.enabled).sort(
    (a, b) => a.priority - b.priority,
  );
}

/**
 * Retorna job board por slug
 */
export function getJobBoardBySlug(slug: string): JobBoard | undefined {
  return JOB_BOARDS.find((board) => board.slug === slug);
}
