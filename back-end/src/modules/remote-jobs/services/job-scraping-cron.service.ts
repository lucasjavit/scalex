import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JobBoardCompany } from '../entities/job-board-company.entity';
import { Job } from '../entities/job.entity';
import { Company } from '../entities/company.entity';
import { GreenhouseScraperService } from '../scrapers/greenhouse-scraper.service';
import { LeverScraperService } from '../scrapers/lever-scraper.service';
import { WorkableScraperService } from '../scrapers/workable-scraper.service';
import { AshbyScraperService } from '../scrapers/ashby-scraper.service';
import { WellfoundScraperService } from '../scrapers/wellfound-scraper.service';
import { BuiltInScraperService } from '../scrapers/builtin-scraper.service';
import { WeWorkRemotelyScraperService } from '../scrapers/weworkremotely-scraper.service';
import { RemotiveScraperService } from '../scrapers/remotive-scraper.service';
import { RemoteYeahScraperService } from '../scrapers/remoteyeah-scraper.service';
import { ScrapedJob } from '../scrapers/base-scraper.service';
import { CronConfigService } from './cron-config.service';

/**
 * Serviço de Cron que executa scraping com intervalo configurável
 * Salva jobs no PostgreSQL e gerencia ciclo de vida (isActive, firstSeenAt, lastSeenAt)
 *
 * Plataformas suportadas:
 * - Greenhouse, Lever, Workable, Ashby (empresas específicas)
 * - Wellfound, Built In (agregadores de empresas)
 * - We Work Remotely, Remotive, RemoteYeah (agregadores RSS)
 *
 * O intervalo do cron pode ser configurado pelo admin via banco de dados
 */
@Injectable()
export class JobScrapingCronService implements OnModuleInit {
  private readonly logger = new Logger(JobScrapingCronService.name);

  constructor(
    @InjectRepository(JobBoardCompany)
    private readonly jobBoardCompanyRepo: Repository<JobBoardCompany>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly greenhouseScraper: GreenhouseScraperService,
    private readonly leverScraper: LeverScraperService,
    private readonly workableScraper: WorkableScraperService,
    private readonly ashbyScraper: AshbyScraperService,
    private readonly wellfoundScraper: WellfoundScraperService,
    private readonly builtinScraper: BuiltInScraperService,
    private readonly weworkremotelyScraper: WeWorkRemotelyScraperService,
    private readonly remotiveScraper: RemotiveScraperService,
    private readonly remoteyeahScraper: RemoteYeahScraperService,
    private readonly cronConfigService: CronConfigService,
  ) {}

  /**
   * Initialize cron job with configuration from database
   */
  async onModuleInit() {
    this.logger.log('🔧 Initializing dynamic cron job...');

    const config = await this.cronConfigService.getCronConfig();
    const description = this.cronConfigService.getCronDescription(config.value);

    this.logger.log(`📅 Cron schedule: ${config.value} (${description})`);

    // Register cron job with dynamic expression
    await this.cronConfigService.updateCronExpression(
      config.value,
      this.handleCron.bind(this),
    );
  }

  /**
   * Cron job handler - called by the dynamic cron
   */
  async handleCron() {
    const config = await this.cronConfigService.getCronConfig();
    const description = this.cronConfigService.getCronDescription(config.value);
    this.logger.log(`🚀 Iniciando scraping agendado (${description})...`);
    await this.scrapeAndSaveJobs();
  }

  /**
   * Método público para executar scraping manualmente (usado em endpoints)
   */
  async scrapeAndSaveJobs(): Promise<{
    total: number;
    created: number;
    updated: number;
    deactivated: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const result = {
      total: 0,
      created: 0,
      updated: 0,
      deactivated: 0,
      errors: [] as string[],
    };

    try {
      // 1. Buscar todas as configurações habilitadas de empresas
      const enabledCompanies = await this.jobBoardCompanyRepo.find({
        where: { enabled: true },
        relations: ['jobBoard', 'company'],
      });

      this.logger.log(
        `📋 ${enabledCompanies.length} empresas habilitadas para scraping`,
      );

      if (enabledCompanies.length === 0) {
        this.logger.warn('⚠️  Nenhuma empresa habilitada para scraping');
        return result;
      }

      // 2. Agrupar empresas por plataforma
      const companiesByPlatform = this.groupByPlatform(enabledCompanies);

      // 3. Fazer scraping de cada plataforma (empresas específicas)
      const allScrapedJobs: ScrapedJob[] = [];

      for (const [platform, companies] of Object.entries(companiesByPlatform)) {
        try {
          this.logger.log(`🔍 Scraping ${platform}: ${companies.length} empresas`);
          const jobs = await this.scrapeByPlatform(platform, companies);
          allScrapedJobs.push(...jobs);
          this.logger.log(`✅ ${platform}: ${jobs.length} vagas encontradas`);
        } catch (error) {
          const errorMsg = `Erro ao fazer scraping de ${platform}: ${error.message}`;
          this.logger.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }

      // 4. Fazer scraping de agregadores RSS (We Work Remotely, Remotive, RemoteYeah)
      const aggregatorJobs = await this.scrapeAggregators();
      allScrapedJobs.push(...aggregatorJobs);
      this.logger.log(`✅ Agregadores RSS: ${aggregatorJobs.length} vagas encontradas`);

      result.total = allScrapedJobs.length;
      this.logger.log(`📦 Total de vagas coletadas: ${allScrapedJobs.length}`);

      // 4. Salvar jobs no PostgreSQL com lógica de upsert
      const { created, updated } = await this.upsertJobs(allScrapedJobs);
      result.created = created;
      result.updated = updated;

      // 5. Marcar jobs inativos (que não foram encontrados neste scraping)
      const deactivated = await this.markInactiveJobs(allScrapedJobs);
      result.deactivated = deactivated;

      // 6. Atualizar contador de jobs nas empresas
      await this.updateCompanyJobCounts();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `🎉 Scraping concluído em ${duration}s! ` +
          `Total: ${result.total} | Criados: ${result.created} | ` +
          `Atualizados: ${result.updated} | Desativados: ${result.deactivated}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`❌ Erro crítico no scraping: ${error.message}`);
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Agrupa empresas por plataforma
   */
  private groupByPlatform(
    companies: JobBoardCompany[],
  ): Record<string, JobBoardCompany[]> {
    const grouped: Record<string, JobBoardCompany[]> = {};

    for (const company of companies) {
      const platform = company.jobBoard.slug;
      if (!grouped[platform]) {
        grouped[platform] = [];
      }
      grouped[platform].push(company);
    }

    return grouped;
  }

  /**
   * Faz scraping de uma plataforma específica
   */
  private async scrapeByPlatform(
    platform: string,
    companies: JobBoardCompany[],
  ): Promise<ScrapedJob[]> {
    let scraper;

    switch (platform) {
      case 'greenhouse':
        scraper = this.greenhouseScraper;
        break;
      case 'lever':
        scraper = this.leverScraper;
        break;
      case 'workable':
        scraper = this.workableScraper;
        break;
      case 'ashby':
        scraper = this.ashbyScraper;
        break;
      case 'wellfound':
        scraper = this.wellfoundScraper;
        break;
      case 'builtin':
        scraper = this.builtinScraper;
        break;
      default:
        this.logger.warn(`⚠️  Plataforma ${platform} não suportada`);
        return [];
    }

    try {
      return await scraper.fetchJobs();
    } catch (error) {
      this.logger.error(
        `❌ Erro ao fazer scraping de ${platform}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Faz scraping de todos os agregadores RSS
   * (We Work Remotely, Remotive, RemoteYeah)
   */
  private async scrapeAggregators(): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = [];

    // We Work Remotely
    try {
      this.logger.log('🔍 Scraping We Work Remotely (RSS)...');
      const weworkremotelyJobs = await this.weworkremotelyScraper.fetchJobs();
      allJobs.push(...weworkremotelyJobs);
      this.logger.log(`✅ We Work Remotely: ${weworkremotelyJobs.length} vagas`);
    } catch (error) {
      this.logger.error(`❌ Erro no We Work Remotely: ${error.message}`);
    }

    // Remotive
    try {
      this.logger.log('🔍 Scraping Remotive (API)...');
      const remotiveJobs = await this.remotiveScraper.fetchJobs();
      allJobs.push(...remotiveJobs);
      this.logger.log(`✅ Remotive: ${remotiveJobs.length} vagas`);
    } catch (error) {
      this.logger.error(`❌ Erro no Remotive: ${error.message}`);
    }

    // RemoteYeah
    try {
      this.logger.log('🔍 Scraping RemoteYeah...');
      const remoteyeahJobs = await this.remoteyeahScraper.fetchJobs();
      allJobs.push(...remoteyeahJobs);
      this.logger.log(`✅ RemoteYeah: ${remoteyeahJobs.length} vagas`);
    } catch (error) {
      this.logger.error(`❌ Erro no RemoteYeah: ${error.message}`);
    }

    return allJobs;
  }

  /**
   * Faz upsert dos jobs no PostgreSQL
   * - Se job já existe (mesmo externalId + platform), atualiza e marca lastSeenAt
   * - Se job é novo, cria e marca firstSeenAt e lastSeenAt
   */
  private async upsertJobs(
    scrapedJobs: ScrapedJob[],
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    const now = new Date();

    this.logger.log(`💾 Salvando ${scrapedJobs.length} jobs no PostgreSQL...`);

    for (const scrapedJob of scrapedJobs) {
      try {
        // Buscar job existente por externalId + platform
        const existingJob = await this.jobRepo.findOne({
          where: {
            externalId: scrapedJob.externalId,
            platform: scrapedJob.platform,
          },
        });

        if (existingJob) {
          // Job já existe - atualizar
          await this.jobRepo.update(existingJob.id, {
            title: scrapedJob.title,
            description: scrapedJob.description,
            location: scrapedJob.location,
            salary: scrapedJob.salary,
            remote: scrapedJob.remote,
            countries: scrapedJob.countries,
            tags: scrapedJob.tags,
            seniority: scrapedJob.seniority,
            employmentType: scrapedJob.employmentType,
            requirements: scrapedJob.requirements,
            benefits: scrapedJob.benefits,
            externalUrl: scrapedJob.externalUrl,
            publishedAt: scrapedJob.publishedAt,
            expiresAt: scrapedJob.expiresAt,
            scrapedAt: now,
            lastSeenAt: now,
            isActive: true,
            status: 'active',
          });
          updated++;
        } else {
          // Job novo - criar
          await this.jobRepo.save({
            externalId: scrapedJob.externalId,
            platform: scrapedJob.platform,
            companySlug: scrapedJob.companySlug,
            title: scrapedJob.title,
            description: scrapedJob.description,
            location: scrapedJob.location,
            salary: scrapedJob.salary,
            remote: scrapedJob.remote,
            countries: scrapedJob.countries,
            tags: scrapedJob.tags,
            seniority: scrapedJob.seniority,
            employmentType: scrapedJob.employmentType,
            requirements: scrapedJob.requirements,
            benefits: scrapedJob.benefits,
            externalUrl: scrapedJob.externalUrl,
            publishedAt: scrapedJob.publishedAt,
            expiresAt: scrapedJob.expiresAt,
            scrapedAt: now,
            firstSeenAt: now,
            lastSeenAt: now,
            isActive: true,
            status: 'active',
          });
          created++;
        }
      } catch (error) {
        this.logger.error(
          `❌ Erro ao salvar job ${scrapedJob.externalId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`✅ Jobs salvos: ${created} criados, ${updated} atualizados`);
    return { created, updated };
  }

  /**
   * Marca jobs como inativos se não foram encontrados no último scraping
   * Considera inativo: jobs que não foram vistos nas últimas 24 horas
   */
  private async markInactiveJobs(
    scrapedJobs: ScrapedJob[],
  ): Promise<number> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // IDs externos das vagas que foram encontradas neste scraping
    const scrapedExternalIds = scrapedJobs.map((j) => ({
      externalId: j.externalId,
      platform: j.platform,
    }));

    // Buscar todos os jobs ativos
    const activeJobs = await this.jobRepo.find({
      where: { isActive: true },
      select: ['id', 'externalId', 'platform', 'lastSeenAt'],
    });

    let deactivated = 0;

    for (const job of activeJobs) {
      // Verificar se este job foi encontrado no scraping atual
      const wasFound = scrapedExternalIds.some(
        (s) => s.externalId === job.externalId && s.platform === job.platform,
      );

      // Se não foi encontrado E última vez visto foi há mais de 24h, marcar como inativo
      if (!wasFound && job.lastSeenAt < twentyFourHoursAgo) {
        await this.jobRepo.update(job.id, {
          isActive: false,
          status: 'expired',
        });
        deactivated++;
      }
    }

    this.logger.log(`🔴 ${deactivated} jobs marcados como inativos`);
    return deactivated;
  }

  /**
   * Atualiza contador de vagas ativas em cada empresa
   */
  private async updateCompanyJobCounts(): Promise<void> {
    const companies = await this.companyRepo.find();

    for (const company of companies) {
      const jobCount = await this.jobRepo.count({
        where: {
          companySlug: company.slug,
          isActive: true,
        },
      });

      await this.companyRepo.update(company.id, {
        totalJobs: jobCount,
      });
    }

    this.logger.log('📊 Contadores de vagas atualizados');
  }
}
