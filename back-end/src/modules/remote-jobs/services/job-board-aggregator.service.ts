import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobService } from './job.service';
import { CompanyService } from './company.service';
import { GenericScraperService } from '../scrapers/generic-scraper.service';
import { GreenhouseScraperService } from '../scrapers/greenhouse-scraper.service';
import { LeverScraperService } from '../scrapers/lever-scraper.service';
import { WorkableScraperService } from '../scrapers/workable-scraper.service';
import { AshbyScraperService } from '../scrapers/ashby-scraper.service';
import { WellfoundScraperService } from '../scrapers/wellfound-scraper.service';
import { BuiltInScraperService } from '../scrapers/builtin-scraper.service';
import { WeWorkRemotelyScraperService } from '../scrapers/weworkremotely-scraper.service';
import { RemotiveScraperService } from '../scrapers/remotive-scraper.service';
import { RemoteYeahScraperService } from '../scrapers/remoteyeah-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { Job } from '../entities/job.entity';
import { ScrapedJob } from '../scrapers/base-scraper.service';

/**
 * Serviço agregador que coordena todos os scrapers de job boards
 * Busca vagas de múltiplos sites usando configuração do banco de dados
 */
@Injectable()
export class JobBoardAggregatorService {
  private readonly logger = new Logger(JobBoardAggregatorService.name);

  constructor(
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly jobService: JobService,
    private readonly companyService: CompanyService,
    private readonly genericScraper: GenericScraperService,
    private readonly greenhouseScraper: GreenhouseScraperService,
    private readonly leverScraper: LeverScraperService,
    private readonly workableScraper: WorkableScraperService,
    private readonly ashbyScraper: AshbyScraperService,
    private readonly wellfoundScraper: WellfoundScraperService,
    private readonly builtinScraper: BuiltInScraperService,
    private readonly weworkremotelyScraper: WeWorkRemotelyScraperService,
    private readonly remotiveScraper: RemotiveScraperService,
    private readonly remoteyeahScraper: RemoteYeahScraperService,
  ) {}

  /**
   * DEPRECATED: Use JobScrapingCronService.scrapeAndSaveJobs() instead
   * This method now delegates to the cron service for consistency
   */
  async fetchAndStoreAllJobs(): Promise<{
    total: number;
    byPlatform: Record<string, number>;
    errors: string[];
  }> {
    this.logger.warn('⚠️  fetchAndStoreAllJobs is deprecated. Jobs are now stored in PostgreSQL via cron.');
    return {
      total: 0,
      byPlatform: {},
      errors: ['Method deprecated - use JobScrapingCronService instead'],
    };
  }

  /**
   * Busca vagas de um job board específico usando o scraper apropriado
   */
  private async fetchFromBoard(board: JobBoard): Promise<ScrapedJob[]> {
    try {
      // Usa scraper específico para Greenhouse
      if (board.scraper === 'greenhouse' || board.slug === 'greenhouse') {
        this.logger.log(`🏢 Usando GreenhouseScraperService para ${board.name}`);
        return await this.greenhouseScraper.fetchJobs();
      }

      // Senão, usa GenericScraper
      this.genericScraper.configure({
        slug: board.slug,
        name: board.name,
        url: board.url,
      });

      return await this.genericScraper.fetchJobs();
    } catch (error) {
      this.logger.error(
        `❌ Erro ao fazer scraping de ${board.name}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Retorna todas as vagas ativas do PostgreSQL com filtros e paginação
   */
  async getAllJobs(filters?: {
    platform?: string;
    remote?: boolean;
    seniority?: string;
    employmentType?: string;
    category?: string;
    jobTitle?: string;
    skills?: string;
    benefits?: string;
    location?: string;
    degree?: string;
    minSalary?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    jobs: Job[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log('🔍 Buscando vagas do PostgreSQL...');

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    // Construir query
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.isActive = :isActive', { isActive: true });

    // Aplicar filtros básicos
    if (filters?.platform && filters.platform !== 'all') {
      queryBuilder.andWhere('job.platform = :platform', {
        platform: filters.platform,
      });
    }

    if (filters?.remote !== undefined) {
      queryBuilder.andWhere('job.remote = :remote', {
        remote: filters.remote,
      });
    }

    if (filters?.seniority) {
      queryBuilder.andWhere('job.seniority = :seniority', {
        seniority: filters.seniority,
      });
    }

    // Filtro por employment type (suporta múltiplos valores separados por vírgula)
    if (filters?.employmentType) {
      const employmentTypes = filters.employmentType.split(',').map(t => t.trim());
      queryBuilder.andWhere('job.employmentType IN (:...employmentTypes)', {
        employmentTypes,
      });
    }

    // Filtro por categoria (busca no título da vaga)
    if (filters?.category && filters.category !== 'all') {
      queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:category)', {
        category: `%${filters.category}%`,
      });
    }

    // Filtro por título (case-insensitive)
    if (filters?.jobTitle) {
      queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:jobTitle)', {
        jobTitle: `%${filters.jobTitle}%`,
      });
    }

    // Filtro por localização (case-insensitive, busca em location e countries)
    // Suporta múltiplos valores separados por vírgula
    // Note: countries is a simple-array (stored as text), not a real array
    if (filters?.location) {
      const locations = filters.location.split(',').map(l => l.trim());
      const conditions = locations.map((_, index) =>
        `(LOWER(job.location) LIKE :location${index} OR LOWER(job.countries) LIKE :location${index})`
      ).join(' OR ');

      const params: any = {};
      locations.forEach((loc, index) => {
        params[`location${index}`] = `%${loc.toLowerCase()}%`;
      });

      queryBuilder.andWhere(`(${conditions})`, params);
    }

    // Filtro por skills/tags (busca em tags array com LIKE para partial match)
    // Note: tags is a simple-array (stored as text), not a real array
    if (filters?.skills) {
      const skillsArray = filters.skills.split(',').map(s => s.trim().toLowerCase());
      const skillConditions = skillsArray.map((_, index) =>
        `LOWER(job.tags) LIKE :skill${index}`
      ).join(' OR ');

      const skillParams: any = {};
      skillsArray.forEach((skill, index) => {
        skillParams[`skill${index}`] = `%${skill}%`;
      });

      queryBuilder.andWhere(`(${skillConditions})`, skillParams);
    }

    // Filtro por benefits (busca em benefits array)
    // Note: benefits is a simple-array (stored as text), not a real array
    if (filters?.benefits) {
      const benefitsArray = filters.benefits.split(',').map(b => b.trim().toLowerCase());
      const benefitConditions = benefitsArray.map((_, index) =>
        `LOWER(job.benefits) LIKE :benefit${index}`
      ).join(' OR ');

      const benefitParams: any = {};
      benefitsArray.forEach((benefit, index) => {
        benefitParams[`benefit${index}`] = `%${benefit}%`;
      });

      queryBuilder.andWhere(`(${benefitConditions})`, benefitParams);
    }

    // Filtro por grau de escolaridade
    if (filters?.degree) {
      if (filters.degree === 'required') {
        // Busca por termos que indicam diploma necessário
        queryBuilder.andWhere(
          "(LOWER(job.description) LIKE :degreePattern1 OR LOWER(job.description) LIKE :degreePattern2 OR LOWER(array_to_string(job.requirements, ',')) LIKE :degreePattern3)",
          {
            degreePattern1: '%degree required%',
            degreePattern2: '%bachelor%',
            degreePattern3: '%degree%',
          },
        );
      } else if (filters.degree === 'not-required') {
        // Busca por termos que indicam que diploma não é necessário
        queryBuilder.andWhere(
          '(LOWER(job.description) LIKE :noDegreePattern1 OR LOWER(job.description) LIKE :noDegreePattern2 OR NOT (LOWER(job.description) LIKE :degreePattern AND LOWER(job.description) LIKE :requiredPattern))',
          {
            noDegreePattern1: '%no degree%',
            noDegreePattern2: '%degree not required%',
            degreePattern: '%degree%',
            requiredPattern: '%required%',
          },
        );
      }
    }

    // Filtro por salário mínimo
    if (filters?.minSalary) {
      const minSalaryNum = parseInt(filters.minSalary);
      if (!isNaN(minSalaryNum)) {
        // Extrai números do campo salary e compara
        // Formato comum: "$120k - $150k/year" ou "$120,000 - $150,000"
        queryBuilder.andWhere(
          `(
            CASE
              WHEN job.salary ~ '\\$[0-9,]+k' THEN
                CAST(REGEXP_REPLACE(REGEXP_REPLACE(job.salary, '\\$([0-9,]+)k.*', '\\1'), ',', '', 'g') AS INTEGER) * 1000
              WHEN job.salary ~ '\\$[0-9,]+' THEN
                CAST(REGEXP_REPLACE(REGEXP_REPLACE(job.salary, '\\$([0-9,]+).*', '\\1'), ',', '', 'g') AS INTEGER)
              ELSE 0
            END
          ) >= :minSalary`,
          {
            minSalary: minSalaryNum,
          },
        );
      }
    }

    // Ordenar por data de publicação (mais recentes primeiro)
    queryBuilder.orderBy('job.publishedAt', 'DESC');

    // Contar total
    const total = await queryBuilder.getCount();

    // Aplicar paginação
    const jobs = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `✅ Página ${page}/${totalPages}: ${jobs.length} vagas retornadas (total: ${total})`,
    );

    return {
      jobs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // All platform-specific scraping methods are deprecated
  // Jobs are now managed by JobScrapingCronService and stored in PostgreSQL

  async fetchAndStoreGreenhouseJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreLeverJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreWorkableJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreAshbyJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreWellfoundJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreBuiltInJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, companies: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreWeWorkRemotelyJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, feeds: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreRemotiveJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, categories: 0, errors: ['Method deprecated'] };
  }

  async fetchAndStoreRemoteYeahJobs() {
    this.logger.warn('⚠️  Deprecated: use JobScrapingCronService');
    return { total: 0, pages: 0, errors: ['Method deprecated'] };
  }

  /**
   * Returns scraping statistics from PostgreSQL
   */
  async getScrapingStats(): Promise<any> {
    const totalJobs = await this.jobRepository.count({ where: { isActive: true } });
    const platforms = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.platform')
      .addSelect('COUNT(*)', 'count')
      .where('job.isActive = :isActive', { isActive: true })
      .groupBy('job.platform')
      .getRawMany();

    const byPlatform: Record<string, number> = {};
    for (const p of platforms) {
      byPlatform[p.job_platform] = parseInt(p.count);
    }

    return {
      total: totalJobs,
      byPlatform,
      errors: [],
      source: 'postgresql',
    };
  }

}
