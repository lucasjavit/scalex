import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';

/**
 * Scraper genérico que funciona para QUALQUER job board
 * Usa configuração do banco de dados e lógica da BaseScraperService
 * Elimina necessidade de criar service específico para cada site
 */
@Injectable()
export class GenericScraperService extends BaseScraperService {
  protected readonly logger = new Logger(GenericScraperService.name);
  protected baseUrl: string = '';
  protected platformName: string = '';
  protected readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  /**
   * Configura o scraper para um job board específico
   */
  configure(jobBoard: { slug: string; name: string; url: string }): void {
    this.platformName = jobBoard.slug;
    // Usa a URL completa (incluindo path para company-specific URLs)
    this.baseUrl = jobBoard.url;

    this.logger.log(`🔧 Scraper configurado para ${jobBoard.name} (${this.baseUrl})`);
  }

  /**
   * Implementação do método abstrato fetchJobs
   * Detecta a plataforma e usa a estratégia apropriada
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    if (!this.baseUrl || !this.platformName) {
      throw new Error('Scraper não configurado. Chame configure() primeiro.');
    }

    try {
      this.logger.log(`🔍 Buscando vagas em ${this.platformName}...`);

      // Detecta o tipo de plataforma pela URL e usa estratégia específica
      const strategy = this.detectPlatformStrategy();

      let jobs: ScrapedJob[] = [];

      switch (strategy) {
        // ATS Platforms
        case 'lever':
          jobs = await this.scrapeLeverJobs();
          break;
        case 'greenhouse':
          jobs = await this.scrapeGreenhouseJobs();
          break;
        case 'workable':
          jobs = await this.scrapeWorkableJobs();
          break;
        case 'ashby':
          jobs = await this.scrapeAshbyJobs();
          break;
        case 'breezy':
          jobs = await this.scrapeBreezyJobs();
          break;
        case 'recruitee':
          jobs = await this.scrapeRecruiteeJobs();
          break;
        case 'teamtailor':
          jobs = await this.scrapeTeamtailorJobs();
          break;
        case 'pinpoint':
          jobs = await this.scrapePinpointJobs();
          break;
        case 'smartrecruiters':
          jobs = await this.scrapeSmartRecruitersJobs();
          break;
        case 'homerun':
          jobs = await this.scrapeHomerunJobs();
          break;

        // Job Board Aggregators
        case 'wellfound':
          jobs = await this.scrapeWellfoundJobs();
          break;
        case 'remoteyeah':
          jobs = await this.scrapeRemoteYeahJobs();
          break;
        case 'builtin':
          jobs = await this.scrapeBuiltInJobs();
          break;
        case 'workatastartup':
          jobs = await this.scrapeWorkAtAStartupJobs();
          break;
        case 'remoterocketship':
          jobs = await this.scrapeRemoteRocketshipJobs();
          break;
        case 'glassdoor':
          jobs = await this.scrapeGlassdoorJobs();
          break;

        default:
          // Fallback: tenta scraping genérico
          jobs = await this.scrapeGenericJobs();
          break;
      }

      this.logger.log(`✅ ${jobs.length} vagas encontradas em ${this.platformName}`);
      return jobs;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar vagas de ${this.platformName}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Detecta qual estratégia usar baseado na URL da plataforma
   */
  private detectPlatformStrategy(): string {
    const url = this.baseUrl.toLowerCase();
    const slug = this.platformName.toLowerCase();

    // ATS Platforms
    if (url.includes('lever.co') || slug.includes('lever')) return 'lever';
    if (url.includes('greenhouse.io') || slug.includes('greenhouse')) return 'greenhouse';
    if (url.includes('workable.com') || slug.includes('workable')) return 'workable';
    if (url.includes('ashbyhq.com') || slug.includes('ashby')) return 'ashby';
    if (url.includes('breezy.hr') || slug.includes('breezy')) return 'breezy';
    if (url.includes('recruitee.com') || slug.includes('recruitee')) return 'recruitee';
    if (url.includes('teamtailor.com') || slug.includes('teamtailor')) return 'teamtailor';
    if (url.includes('pinpointhq.com') || slug.includes('pinpoint')) return 'pinpoint';
    if (url.includes('smartrecruiters.com') || slug.includes('smartrecruiters')) return 'smartrecruiters';
    if (url.includes('homerun.co') || slug.includes('homerun')) return 'homerun';

    // Job Board Aggregators
    if (url.includes('wellfound.com') || url.includes('angel.co') || slug.includes('wellfound')) return 'wellfound';
    if (url.includes('remoteyeah.com') || slug.includes('remoteyeah')) return 'remoteyeah';
    if (url.includes('builtin.com') || slug.includes('builtin')) return 'builtin';
    if (url.includes('workatastartup.com') || slug.includes('workatastartup')) return 'workatastartup';
    if (url.includes('remoterocketship.com') || slug.includes('remoterocketship')) return 'remoterocketship';
    if (url.includes('glassdoor.com') || slug.includes('glassdoor')) return 'glassdoor';

    return 'generic';
  }

  /**
   * Scraping genérico (fallback)
   */
  private async scrapeGenericJobs(): Promise<ScrapedJob[]> {
    const html = await this.fetchHtml(this.baseUrl);
    const $ = this.parseHtml(html);
    const jobs: ScrapedJob[] = [];

    // Estratégia 1: Tenta extrair JSON-LD (padrão Schema.org)
    const jsonLdJobs = this.extractJsonLD($, 'JobPosting');
    for (const jsonData of jsonLdJobs) {
      const job = this.transformJsonLdJob(jsonData);
      if (job && this.isValidJob(job)) {
        jobs.push(job);
      }
    }

    // Estratégia 2: Fallback - extrai de HTML com seletores genéricos
    if (jobs.length === 0) {
      const selectors = [
        '.job-card',
        '[data-testid="job-card"]',
        '.job-item',
        '.job-listing',
        '[class*="JobCard"]',
        '[class*="job-card"]',
        'article[class*="job"]',
        'div[class*="job-post"]',
      ];

      for (const selector of selectors) {
        $(selector).each((_, element) => {
          const job = this.extractJobFromCard($, element);
          if (job && this.isValidJob(job)) {
            jobs.push(job);
          }
        });

        if (jobs.length > 0) break;
      }
    }

    return jobs;
  }

  /**
   * Scraper específico para Lever.co
   */
  private async scrapeLeverJobs(): Promise<ScrapedJob[]> {
    // Lever usa JSON-LD, então usamos estratégia genérica
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper específico para Greenhouse.io
   *
   * NOTA: Este método não é mais usado diretamente.
   * O Greenhouse agora usa GreenhouseScraperService que itera sobre
   * múltiplas empresas. Este fallback existe apenas por compatibilidade.
   */
  private async scrapeGreenhouseJobs(): Promise<ScrapedJob[]> {
    this.logger.warn(
      '⚠️  Greenhouse detectado mas URL company-specific. Use GreenhouseScraperService para buscar de múltiplas empresas.',
    );

    // Se for URL company-specific, tenta buscar apenas dela
    if (this.baseUrl.includes('boards-api.greenhouse.io/v1/boards/')) {
      try {
        const response = await this.httpService.axiosRef.get(this.baseUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': this.userAgent,
            Accept: 'application/json',
          },
        });

        const jobs = response.data?.jobs || [];
        const remoteJobs = jobs.filter((job: any) => {
          const location = job.location?.name?.toLowerCase() || '';
          return (
            location.includes('remote') ||
            location.includes('anywhere') ||
            location.includes('work from home')
          );
        });

        this.logger.log(`✅ ${remoteJobs.length} vagas remotas encontradas`);

        return remoteJobs.map((job: any) => ({
          externalId: `greenhouse-${job.id}`,
          platform: this.platformName,
          companySlug: this.platformName, // Usa platformName como fallback
          title: this.cleanText(job.title),
          description: this.cleanText(job.content || job.title),
          location: job.location?.name || 'Remote',
          salary: undefined,
          remote: true,
          countries: [],
          tags: job.departments?.map((d: any) => d.name) || [],
          seniority: this.inferSeniority(job.title),
          employmentType: this.mapEmploymentType(job.employment_type),
          requirements: [],
          benefits: [],
          externalUrl: job.absolute_url,
          publishedAt: new Date(job.updated_at || Date.now()),
        }));
      } catch (error) {
        this.logger.error(`❌ Erro ao buscar Greenhouse: ${error.message}`);
        return [];
      }
    }

    return [];
  }

  /**
   * Scraper específico para Workable.com
   */
  private async scrapeWorkableJobs(): Promise<ScrapedJob[]> {
    // Workable usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper específico para Ashby HQ
   */
  private async scrapeAshbyJobs(): Promise<ScrapedJob[]> {
    // Ashby usa estrutura própria
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper específico para Wellfound (AngelList)
   */
  private async scrapeWellfoundJobs(): Promise<ScrapedJob[]> {
    // Wellfound tem API pública
    try {
      const apiUrl = 'https://wellfound.com/api/v2/jobs';
      const response = await this.httpService.axiosRef.get(apiUrl, {
        params: { remote: true },
        headers: { 'User-Agent': this.userAgent },
      });

      const jobs: ScrapedJob[] = [];
      if (response.data?.jobs) {
        for (const job of response.data.jobs) {
          jobs.push({
            externalId: this.generateId(job.id),
            platform: this.platformName,
            companySlug: this.extractCompanySlug(job.company?.name || 'Unknown'),
            title: this.cleanText(job.title),
            description: this.cleanText(job.description || job.title),
            location: job.location || 'Remote',
            salary: this.parseSalary(job.salary),
            remote: true,
            countries: [],
            tags: job.skills || [],
            seniority: this.inferSeniority(job.title),
            employmentType: this.mapEmploymentType(job.job_type),
            requirements: [],
            benefits: [],
            externalUrl: this.normalizeUrl(job.url || `https://wellfound.com/jobs/${job.id}`),
            publishedAt: job.created_at ? new Date(job.created_at) : new Date(),
          });
        }
      }
      return jobs;
    } catch (error) {
      this.logger.warn(`⚠️  Wellfound API falhou, tentando scraping HTML: ${error.message}`);
      return this.scrapeGenericJobs();
    }
  }

  /**
   * Scraper específico para RemoteYeah.com
   */
  private async scrapeRemoteYeahJobs(): Promise<ScrapedJob[]> {
    // RemoteYeah usa JSON-LD muito bem estruturado
    return this.scrapeGenericJobs();
  }

  /**
   * Transforma JSON-LD em formato padrão
   */
  private transformJsonLdJob(jsonData: any): ScrapedJob | null {
    try {
      const url = jsonData.url || jsonData.identifier;
      const companyName = jsonData.hiringOrganization?.name || 'Unknown';

      return {
        externalId: this.generateId(url),
        platform: this.platformName,
        companySlug: this.extractCompanySlug(companyName),
        title: this.cleanText(jsonData.title),
        description: this.cleanText(jsonData.description),
        location: jsonData.jobLocation?.address?.addressLocality || 'Remote',
        salary: this.parseSalary(jsonData.baseSalary),
        remote: true,
        countries: this.extractCountries(
          jsonData.applicantLocationRequirements,
        ),
        tags: this.extractTags(jsonData.skills || jsonData.occupationalCategory),
        seniority: this.inferSeniority(jsonData.title),
        employmentType: this.mapEmploymentType(jsonData.employmentType),
        requirements: [],
        benefits: [],
        externalUrl: this.normalizeUrl(url),
        publishedAt: jsonData.datePosted
          ? new Date(jsonData.datePosted)
          : new Date(),
      };
    } catch (error) {
      this.logger.warn(
        `⚠️  Erro ao transformar JSON-LD de ${this.platformName}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Extrai job de card HTML usando múltiplos seletores genéricos
   */
  private extractJobFromCard($: any, element: any): ScrapedJob | null {
    try {
      const $card = $(element);

      // Lista de seletores possíveis para cada campo
      const titleSelectors = [
        'h2', 'h3',
        '.job-title', '[data-testid="job-title"]',
        '[class*="title"]', '[class*="Title"]',
      ];

      const companySelectors = [
        '.company-name', '[data-testid="company-name"]',
        '[class*="company"]', '[class*="Company"]',
      ];

      const locationSelectors = [
        '.location', '[data-testid="location"]',
        '[class*="location"]', '[class*="Location"]',
      ];

      const descriptionSelectors = [
        '.description', '[data-testid="description"]',
        '[class*="description"]', '[class*="Description"]',
      ];

      // Busca cada campo tentando múltiplos seletores
      const title = this.findTextWithSelectors($card, titleSelectors);
      const company = this.findTextWithSelectors($card, companySelectors);
      const location = this.findTextWithSelectors($card, locationSelectors);
      const description = this.findTextWithSelectors($card, descriptionSelectors);

      // Busca URL do job
      const url = $card.find('a[href*="/job"]').first().attr('href') ||
                  $card.find('a').first().attr('href');

      if (!title || !company || !url) {
        return null;
      }

      return {
        externalId: this.generateId(url),
        platform: this.platformName,
        companySlug: this.extractCompanySlug(company),
        title,
        description: description || title,
        location: location || 'Remote',
        salary: undefined,
        remote: true,
        countries: [],
        tags: [],
        seniority: this.inferSeniority(title),
        employmentType: 'full-time',
        requirements: [],
        benefits: [],
        externalUrl: this.normalizeUrl(url),
        publishedAt: new Date(),
      };
    } catch (error) {
      this.logger.warn(`⚠️  Erro ao extrair card: ${error.message}`);
      return null;
    }
  }

  /**
   * Helper: tenta múltiplos seletores até encontrar texto
   */
  private findTextWithSelectors($element: any, selectors: string[]): string {
    for (const selector of selectors) {
      const text = this.cleanText($element.find(selector).first().text());
      if (text) return text;
    }
    return '';
  }

  // ===========================================
  // JOB BOARD AGGREGATORS IMPLEMENTATIONS
  // ===========================================

  /**
   * Scraper for Built In (builtin.com)
   * Built In é um job board para tech jobs com foco em startups
   */
  private async scrapeBuiltInJobs(): Promise<ScrapedJob[]> {
    try {
      // Built In tem API pública para remote jobs
      const apiUrl = 'https://builtin.com/api/jobs';
      const response = await this.httpService.axiosRef.get(apiUrl, {
        params: {
          remote: true,
          per_page: 100,
        },
        headers: { 'User-Agent': this.userAgent },
      });

      const jobs: ScrapedJob[] = [];
      if (response.data?.jobs) {
        for (const job of response.data.jobs) {
          jobs.push({
            externalId: this.generateId(job.id?.toString() || job.url),
            platform: this.platformName,
            companySlug: this.extractCompanySlug(job.company?.name || 'Unknown'),
            title: this.cleanText(job.title),
            description: this.cleanText(job.description || job.title),
            location: job.location || 'Remote',
            salary: this.parseSalary(job.salary_range),
            remote: true,
            countries: [],
            tags: job.skills || [],
            seniority: this.inferSeniority(job.title),
            employmentType: this.mapEmploymentType(job.job_type),
            requirements: [],
            benefits: [],
            externalUrl: this.normalizeUrl(job.url || `https://builtin.com/job/${job.id}`),
            publishedAt: job.published_at ? new Date(job.published_at) : new Date(),
          });
        }
      }
      return jobs;
    } catch (error) {
      this.logger.warn(`⚠️  Built In API falhou, tentando scraping HTML: ${error.message}`);
      return this.scrapeGenericJobs();
    }
  }

  /**
   * Scraper for Work at a Startup (Y Combinator)
   */
  private async scrapeWorkAtAStartupJobs(): Promise<ScrapedJob[]> {
    try {
      // Work at a Startup tem página de remote jobs
      const url = 'https://www.workatastartup.com/jobs?remote=true';
      const html = await this.fetchHtml(url);
      const $ = this.parseHtml(html);
      const jobs: ScrapedJob[] = [];

      // Tenta extrair JSON-LD primeiro
      const jsonLdJobs = this.extractJsonLD($, 'JobPosting');
      for (const jsonData of jsonLdJobs) {
        const job = this.transformJsonLdJob(jsonData);
        if (job && this.isValidJob(job)) {
          jobs.push(job);
        }
      }

      // Se não encontrou, tenta seletores específicos
      if (jobs.length === 0) {
        $('.job-list-item, [data-testid="job-item"]').each((_, element) => {
          const job = this.extractJobFromCard($, element);
          if (job && this.isValidJob(job)) {
            jobs.push(job);
          }
        });
      }

      return jobs;
    } catch (error) {
      this.logger.warn(`⚠️  Work at a Startup scraping falhou: ${error.message}`);
      return [];
    }
  }

  /**
   * Scraper for Remote Rocketship
   */
  private async scrapeRemoteRocketshipJobs(): Promise<ScrapedJob[]> {
    // Remote Rocketship usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for Glassdoor
   */
  private async scrapeGlassdoorJobs(): Promise<ScrapedJob[]> {
    try {
      // Glassdoor requer web scraping mais sofisticado
      // Por enquanto, usa estratégia genérica
      this.logger.warn('⚠️  Glassdoor scraping não totalmente implementado, usando genérico');
      return this.scrapeGenericJobs();
    } catch (error) {
      this.logger.warn(`⚠️  Glassdoor scraping falhou: ${error.message}`);
      return [];
    }
  }

  // ===========================================
  // ATS PLATFORMS IMPLEMENTATIONS
  // ===========================================

  /**
   * Scraper for Breezy HR
   */
  private async scrapeBreezyJobs(): Promise<ScrapedJob[]> {
    // Breezy usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for Recruitee
   */
  private async scrapeRecruiteeJobs(): Promise<ScrapedJob[]> {
    // Recruitee usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for Teamtailor
   */
  private async scrapeTeamtailorJobs(): Promise<ScrapedJob[]> {
    // Teamtailor usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for Pinpoint HQ
   */
  private async scrapePinpointJobs(): Promise<ScrapedJob[]> {
    // Pinpoint usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for SmartRecruiters
   */
  private async scrapeSmartRecruitersJobs(): Promise<ScrapedJob[]> {
    // SmartRecruiters usa JSON-LD
    return this.scrapeGenericJobs();
  }

  /**
   * Scraper for Homerun
   */
  private async scrapeHomerunJobs(): Promise<ScrapedJob[]> {
    // Homerun usa JSON-LD
    return this.scrapeGenericJobs();
  }
}
