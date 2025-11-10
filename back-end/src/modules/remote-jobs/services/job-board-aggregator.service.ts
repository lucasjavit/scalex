import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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
   * Busca vagas de TODOS os job boards habilitados (do BD) e SALVA NO REDIS
   * Retorna estatísticas de quantas vagas foram encontradas e salvas no cache
   */
  async fetchAndStoreAllJobs(): Promise<{
    total: number;
    byPlatform: Record<string, number>;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🚀 Iniciando busca em todos os job boards...');

    const result = {
      total: 0,
      byPlatform: {} as Record<string, number>,
      errors: [] as string[],
    };

    // Busca job boards habilitados DO BANCO DE DADOS
    const enabledBoards = await this.jobBoardRepository.find({
      where: { enabled: true },
      order: { priority: 'ASC', slug: 'ASC' },
    });

    this.logger.log(
      `📋 ${enabledBoards.length} job boards habilitados para scraping`,
    );

    // Busca vagas de cada plataforma em paralelo
    const promises = enabledBoards.map((board) =>
      this.fetchFromBoard(board),
    );

    const results = await Promise.allSettled(promises);

    // Array para armazenar TODAS as vagas
    const allJobs: ScrapedJob[] = [];

    // Processa resultados
    for (let i = 0; i < results.length; i++) {
      const board = enabledBoards[i];
      const scrapeResult = results[i];

      if (scrapeResult.status === 'fulfilled') {
        const jobs = scrapeResult.value;
        result.byPlatform[board.slug] = jobs.length;
        result.total += jobs.length;

        // Adiciona vagas ao array geral
        allJobs.push(...jobs);

        // Salva vagas por plataforma no Redis (30 min TTL)
        await this.cacheManager.set(
          `jobs:platform:${board.slug}`,
          jobs,
          1800,
        );

        this.logger.log(
          `✅ ${jobs.length} vagas de ${board.name} salvas no Redis`,
        );
      } else {
        const errorMsg = `Erro ao buscar vagas de ${board.name}: ${scrapeResult.reason}`;
        this.logger.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        result.byPlatform[board.slug] = 0;
      }
    }

    // Salva TODAS as vagas no Redis (30 min TTL)
    this.logger.log(`🔍 Tentando salvar ${allJobs.length} vagas no Redis...`);
    await this.cacheManager.set('jobs:all', allJobs, 1800 * 1000);

    // Verifica se realmente salvou
    const test = await this.cacheManager.get('jobs:all');
    this.logger.log(`✅ Verificação: ${test ? 'Dados encontrados' : 'ERRO: Dados não encontrados!'}`);
    this.logger.log(`💾 Total: ${allJobs.length} vagas salvas no Redis`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.log(
      `🎉 Scraping finalizado! ${result.total} vagas em ${duration}s`,
    );

    // Salva estatísticas no cache por 30 minutos
    await this.cacheManager.set('job-boards:last-scrape', result, 1800 * 1000);

    return result;
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
   * Retorna todas as vagas do Redis com filtros e paginação
   */
  async getAllJobs(filters?: {
    platform?: string;
    remote?: boolean;
    seniority?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    jobs: ScrapedJob[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log('🔍 Buscando vagas do Redis...');

    let jobs: ScrapedJob[] = [];

    // Se platform for 'all' ou não especificado, busca de TODAS as plataformas
    if (!filters?.platform || filters.platform === 'all') {
      this.logger.log('🌍 Buscando vagas de TODAS as plataformas...');

      const platforms = [
        'greenhouse',
        'lever',
        'workable',
        'ashby',
        'wellfound',
        'builtin',
        'weworkremotely',
        'remotive',
        'remoteyeah'
      ];

      for (const platform of platforms) {
        const cacheKey = `jobs:platform:${platform}`;
        const platformJobs = await this.cacheManager.get<ScrapedJob[]>(cacheKey);

        if (platformJobs && platformJobs.length > 0) {
          this.logger.log(`  ✅ ${platform}: ${platformJobs.length} vagas`);
          jobs.push(...platformJobs);
        } else {
          this.logger.log(`  ⚠️  ${platform}: 0 vagas`);
        }
      }

      this.logger.log(`📦 Total agregado: ${jobs.length} vagas de todas as plataformas`);
    } else {
      // Busca de uma plataforma específica
      const cacheKey = `jobs:platform:${filters.platform}`;
      this.logger.log(`🔑 Buscando chave: ${cacheKey}`);

      jobs = await this.cacheManager.get<ScrapedJob[]>(cacheKey) || [];
      this.logger.log(`📊 Resultado: ${jobs.length} vagas`);
    }

    if (jobs.length === 0) {
      this.logger.warn('⚠️  Nenhuma vaga encontrada no cache');
      return {
        jobs: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        totalPages: 0,
      };
    }

    this.logger.log(`📦 ${jobs.length} vagas encontradas no Redis`);

    // Aplica filtros em memória
    if (filters) {
      if (filters.remote !== undefined) {
        jobs = jobs.filter((job) => job.remote === filters.remote);
      }

      if (filters.seniority) {
        jobs = jobs.filter((job) => job.seniority === filters.seniority);
      }

      if (filters.employmentType) {
        jobs = jobs.filter(
          (job) => job.employmentType === filters.employmentType,
        );
      }
    }

    // Total após filtros
    const total = jobs.length;

    // Paginação
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedJobs = jobs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    this.logger.log(
      `✅ Página ${page}/${totalPages}: ${paginatedJobs.length} vagas retornadas (total: ${total})`,
    );

    return {
      jobs: paginatedJobs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca vagas APENAS de empresas Greenhouse e salva no Redis
   */
  async fetchAndStoreGreenhouseJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🏢 Iniciando scraping apenas do Greenhouse...');

    try {
      const jobs = await this.greenhouseScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:greenhouse', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:greenhouse', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Greenhouse: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Greenhouse: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Busca vagas APENAS de empresas Lever e salva no Redis
   */
  async fetchAndStoreLeverJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('⚙️ Iniciando scraping apenas do Lever...');

    try {
      const jobs = await this.leverScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:lever', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:lever', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Lever: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Lever: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Busca vagas APENAS de empresas Workable e salva no Redis
   */
  async fetchAndStoreWorkableJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🏗️ Iniciando scraping apenas do Workable...');

    try {
      const jobs = await this.workableScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:workable', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:workable', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Workable: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Workable: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Busca vagas APENAS de empresas Ashby e salva no Redis
   */
  async fetchAndStoreAshbyJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🏛️ Iniciando scraping apenas do Ashby...');

    try {
      const jobs = await this.ashbyScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:ashby', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:ashby', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Ashby: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Ashby: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * POST /remote-jobs/job-boards/scrape-wellfound
   * Dispara scraping APENAS de empresas Wellfound
   * Salva todas as vagas encontradas no Redis
   */
  async fetchAndStoreWellfoundJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🌐 Iniciando scraping apenas do Wellfound...');

    try {
      const jobs = await this.wellfoundScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:wellfound', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:wellfound', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Wellfound: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Wellfound: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * POST /remote-jobs/job-boards/scrape-builtin
   * Dispara scraping APENAS de empresas Built In
   * Salva todas as vagas encontradas no Redis
   */
  async fetchAndStoreBuiltInJobs(): Promise<{
    total: number;
    companies: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🏗️ Iniciando scraping apenas do Built In...');

    try {
      const jobs = await this.builtinScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:builtin', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:builtin', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Built In: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        companies: new Set(jobs.map((j) => j.companySlug)).size,
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Built In: ${error.message}`);
      return {
        total: 0,
        companies: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * POST /remote-jobs/job-boards/scrape-weworkremotely
   * Dispara scraping APENAS do We Work Remotely (RSS feeds)
   * Salva todas as vagas encontradas no Redis
   */
  async fetchAndStoreWeWorkRemotelyJobs(): Promise<{
    total: number;
    feeds: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('💼 Iniciando scraping apenas do We Work Remotely...');

    try {
      const jobs = await this.weworkremotelyScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:weworkremotely', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:weworkremotely', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ We Work Remotely: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        feeds: 2, // Número de RSS feeds configurados
        errors: [],
      };
    } catch (error) {
      this.logger.error(
        `❌ Erro no scraping do We Work Remotely: ${error.message}`,
      );
      return {
        total: 0,
        feeds: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * POST /remote-jobs/job-boards/scrape-remotive
   * Dispara scraping APENAS do Remotive (API pública)
   * Salva todas as vagas encontradas no Redis
   */
  async fetchAndStoreRemotiveJobs(): Promise<{
    total: number;
    categories: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🌐 Iniciando scraping apenas do Remotive...');

    try {
      const jobs = await this.remotiveScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:remotive', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:remotive', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Remotive: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        categories: 3, // Número de categorias configuradas
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do Remotive: ${error.message}`);
      return {
        total: 0,
        categories: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Busca vagas do RemoteYeah e salva no Redis
   */
  async fetchAndStoreRemoteYeahJobs(): Promise<{
    total: number;
    pages: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    this.logger.log('🌟 Iniciando scraping apenas do RemoteYeah...');

    try {
      const jobs = await this.remoteyeahScraper.fetchJobs();

      // Salva no Redis com chaves específicas (30 min TTL)
      await this.cacheManager.set('jobs:remoteyeah', jobs, 1800 * 1000);
      await this.cacheManager.set('jobs:platform:remoteyeah', jobs, 1800 * 1000);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ RemoteYeah: ${jobs.length} vagas salvas no Redis em ${duration}s`,
      );

      return {
        total: jobs.length,
        pages: 5, // Número de páginas configuradas
        errors: [],
      };
    } catch (error) {
      this.logger.error(`❌ Erro no scraping do RemoteYeah: ${error.message}`);
      return {
        total: 0,
        pages: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Retorna estatísticas do último scraping
   */
  async getScrapingStats(): Promise<any> {
    const stats = await this.cacheManager.get('job-boards:last-scrape');
    return stats || { total: 0, byPlatform: {}, errors: [] };
  }

  /**
   * Limpa cache de jobs
   */
  async clearJobsCache(): Promise<void> {
    // TODO: Implementar limpeza de todos os caches de jobs
    await this.cacheManager.del('job-boards:last-scrape');
    this.logger.log('🗑️  Cache de jobs limpo');
  }
}
