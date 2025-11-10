import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import {
  getVerifiedWellfoundCompanies,
  WellfoundCompany,
} from '../config/wellfound-companies';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

/**
 * Scraper específico para Wellfound (formerly AngelList Talent)
 *
 * Wellfound NÃO tem API pública.
 * Os dados são embutidos no HTML como JSON no script tag __NEXT_DATA__
 *
 * URL Pattern: https://wellfound.com/company/{company}
 * Dados: Extraídos de <script id="__NEXT_DATA__" type="application/json">
 */
@Injectable()
export class WellfoundScraperService extends BaseScraperService {
  protected readonly logger = new Logger(WellfoundScraperService.name);
  protected readonly baseUrl = 'https://wellfound.com/company';
  protected readonly platformName = 'wellfound';

  // Configurações de rate limiting
  private readonly MAX_CONCURRENT_REQUESTS = 3; // Mais conservador para scraping HTML
  private readonly REQUEST_DELAY_MS = 1000; // Delay maior para evitar bloqueios
  private readonly TIMEOUT_MS = 20000; // Timeout maior para páginas HTML

  // Estatísticas
  private stats = {
    totalCompanies: 0,
    successfulCompanies: 0,
    failedCompanies: 0,
    totalJobs: 0,
    remoteJobs: 0,
    errors: [] as { company: string; error: string }[],
  };

  constructor(httpService: HttpService) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas Wellfound
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Wellfound (multi-company)...');
    this.resetStats();

    const companies = getVerifiedWellfoundCompanies();
    this.stats.totalCompanies = companies.length;

    this.logger.log(`📋 ${companies.length} empresas para processar`);

    const allJobs: ScrapedJob[] = [];

    // Processa empresas em batches para não sobrecarregar
    for (let i = 0; i < companies.length; i += this.MAX_CONCURRENT_REQUESTS) {
      const batch = companies.slice(i, i + this.MAX_CONCURRENT_REQUESTS);

      this.logger.log(
        `📦 Processando batch ${Math.floor(i / this.MAX_CONCURRENT_REQUESTS) + 1}/${Math.ceil(companies.length / this.MAX_CONCURRENT_REQUESTS)}...`,
      );

      // Processa empresas do batch em paralelo
      const batchResults = await Promise.all(
        batch.map((company) => this.fetchCompanyJobs(company)),
      );

      // Adiciona jobs encontrados
      for (const jobs of batchResults) {
        allJobs.push(...jobs);
      }

      // Delay entre batches
      if (i + this.MAX_CONCURRENT_REQUESTS < companies.length) {
        await this.delay(this.REQUEST_DELAY_MS);
      }
    }

    this.logStats();
    return allJobs;
  }

  /**
   * Busca vagas de uma empresa específica extraindo __NEXT_DATA__ do HTML
   */
  private async fetchCompanyJobs(
    company: WellfoundCompany,
  ): Promise<ScrapedJob[]> {
    try {
      const companyUrl = `${this.baseUrl}/${company.slug}`;

      this.logger.debug(`🔍 Buscando ${company.name} (${company.slug})...`);

      // Faz requisição HTTP com headers para parecer um navegador
      const response = await firstValueFrom(
        this.httpService.get<string>(companyUrl, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
          },
        }),
      );

      const html = response.data;

      // Extrai __NEXT_DATA__ do HTML
      const $ = cheerio.load(html);
      const nextDataScript = $('#__NEXT_DATA__').html();

      if (!nextDataScript) {
        this.logger.warn(
          `❌ ${company.name}: __NEXT_DATA__ não encontrado (página pode ter mudado)`,
        );
        this.stats.failedCompanies++;
        this.stats.errors.push({
          company: company.name,
          error: '__NEXT_DATA__ não encontrado',
        });
        return [];
      }

      // Parse JSON do __NEXT_DATA__
      const nextData = JSON.parse(nextDataScript);
      const apolloState = nextData?.props?.pageProps?.apolloState?.data;

      if (!apolloState) {
        this.logger.warn(
          `❌ ${company.name}: apolloState não encontrado no __NEXT_DATA__`,
        );
        this.stats.failedCompanies++;
        this.stats.errors.push({
          company: company.name,
          error: 'apolloState não encontrado',
        });
        return [];
      }

      // Extrai jobs do Apollo State (estrutura de grafo)
      const jobs = this.extractJobsFromApolloState(apolloState, company);

      if (jobs.length === 0) {
        this.logger.debug(`⚪ ${company.name}: 0 vagas`);
        this.stats.successfulCompanies++;
        return [];
      }

      // Filtra apenas vagas remotas
      const remoteJobs = jobs.filter((job) => this.isRemoteJob(job));

      this.logger.log(
        `✅ ${company.name}: ${remoteJobs.length}/${jobs.length} vagas remotas`,
      );

      this.stats.successfulCompanies++;
      this.stats.totalJobs += jobs.length;
      this.stats.remoteJobs += remoteJobs.length;

      return remoteJobs;
    } catch (error) {
      const errorMessage =
        error.response?.status === 403
          ? '403 - Acesso bloqueado (anti-scraping)'
          : error.response?.status === 404
            ? '404 - Empresa não encontrada'
            : error.message;

      this.logger.warn(`❌ ${company.name}: ${errorMessage}`);

      this.stats.failedCompanies++;
      this.stats.errors.push({
        company: company.name,
        error: errorMessage,
      });

      return [];
    }
  }

  /**
   * Extrai jobs da estrutura Apollo State (grafo de dados do GraphQL)
   */
  private extractJobsFromApolloState(
    apolloState: any,
    company: WellfoundCompany,
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    try {
      // Apollo State é um grafo: cada node tem formato "Type:ID"
      // Exemplo: "JobListingSearchResult:12345", "Startup:67890"
      for (const key of Object.keys(apolloState)) {
        // Procura por job listings
        if (
          key.startsWith('JobListingSearchResult:') ||
          key.startsWith('JobListing:')
        ) {
          const jobData = apolloState[key];

          if (jobData && jobData.title) {
            const job = this.transformWellfoundJob(jobData, company);
            if (job) {
              jobs.push(job);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Erro ao extrair jobs do Apollo State: ${error.message}`,
      );
    }

    return jobs;
  }

  /**
   * Transforma job do Wellfound em formato padrão
   */
  private transformWellfoundJob(
    jobData: any,
    company: WellfoundCompany,
  ): ScrapedJob | null {
    try {
      const title = jobData.title || '';
      const description = jobData.description || jobData.descriptionPlain || '';
      const locations = jobData.locationNames || jobData.locations || [];
      const location = Array.isArray(locations)
        ? locations.join(', ')
        : locations || 'Remote';

      // Wellfound usa "slug" para identificar a vaga
      const jobSlug = jobData.slug || jobData.id;
      const externalUrl = jobSlug
        ? `https://wellfound.com/l/${jobSlug}`
        : `https://wellfound.com/company/${company.slug}`;

      // Compensation (pode ter salary range)
      const compensation = jobData.compensation;
      const salary =
        compensation?.minAmount && compensation?.maxAmount
          ? `$${compensation.minAmount}-${compensation.maxAmount} ${compensation.currency || 'USD'}`
          : undefined;

      // Remote flag
      const isRemote =
        jobData.remote === true ||
        jobData.remotePreference === 'remote_only' ||
        location.toLowerCase().includes('remote');

      // Published date
      const publishedAt = jobData.liveStartAt
        ? new Date(jobData.liveStartAt)
        : new Date();

      return {
        externalId: `wellfound-${company.slug}-${jobSlug || Date.now()}`,
        platform: this.platformName,
        companySlug: company.slug,
        title: this.cleanText(title),
        description: this.cleanText(description),
        location: location,
        salary: salary,
        remote: isRemote,
        countries: [], // Wellfound não separa países claramente
        tags: this.extractTagsFromTitle(title),
        seniority: this.inferSeniority(title),
        employmentType: this.mapEmploymentType(jobData.jobType),
        requirements: [],
        benefits: [],
        externalUrl: externalUrl,
        publishedAt: publishedAt,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao transformar job: ${error.message}`,
        JSON.stringify(jobData),
      );
      return null;
    }
  }

  /**
   * Verifica se uma vaga é remota
   */
  private isRemoteJob(job: ScrapedJob): boolean {
    // Primeiro checa o campo explícito `remote`
    if (job.remote === true) {
      return true;
    }

    // Fallback: checa keywords em location, title e description
    const location = job.location?.toLowerCase() || '';
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';

    const remoteKeywords = [
      'remote',
      'anywhere',
      'work from home',
      'wfh',
      'distributed',
      'virtual',
      'telecommute',
      'home office',
    ];

    return remoteKeywords.some(
      (keyword) =>
        location.includes(keyword) ||
        title.includes(keyword) ||
        description.includes(keyword),
    );
  }

  /**
   * Extrai tags do título
   */
  private extractTagsFromTitle(title: string): string[] {
    const tags: string[] = [];
    const titleLower = title.toLowerCase();

    const commonSkills = [
      'javascript',
      'typescript',
      'python',
      'java',
      'react',
      'node',
      'golang',
      'rust',
      'kubernetes',
      'aws',
      'gcp',
      'azure',
      'devops',
      'frontend',
      'backend',
      'fullstack',
      'full-stack',
      'full stack',
      'mobile',
      'ios',
      'android',
    ];

    for (const skill of commonSkills) {
      if (titleLower.includes(skill)) {
        tags.push(skill);
      }
    }

    return [...new Set(tags)];
  }

  /**
   * Helper: delay para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset das estatísticas
   */
  private resetStats(): void {
    this.stats = {
      totalCompanies: 0,
      successfulCompanies: 0,
      failedCompanies: 0,
      totalJobs: 0,
      remoteJobs: 0,
      errors: [],
    };
  }

  /**
   * Log das estatísticas finais
   */
  private logStats(): void {
    this.logger.log('');
    this.logger.log('📊 ==================== ESTATÍSTICAS ====================');
    this.logger.log(
      `📋 Total de empresas processadas: ${this.stats.totalCompanies}`,
    );
    this.logger.log(`✅ Empresas com sucesso: ${this.stats.successfulCompanies}`);
    this.logger.log(`❌ Empresas com erro: ${this.stats.failedCompanies}`);
    this.logger.log(`💼 Total de vagas encontradas: ${this.stats.totalJobs}`);
    this.logger.log(`🌍 Vagas remotas (filtradas): ${this.stats.remoteJobs}`);
    this.logger.log(
      `📈 Taxa de sucesso: ${((this.stats.successfulCompanies / this.stats.totalCompanies) * 100).toFixed(1)}%`,
    );

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Empresas com erro (primeiras 10):');
      for (const error of this.stats.errors.slice(0, 10)) {
        this.logger.warn(`   - ${error.company}: ${error.error}`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
