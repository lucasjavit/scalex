import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import {
  getVerifiedBuiltInCompanies,
  BuiltInCompany,
} from '../config/builtin-companies';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

/**
 * Scraper específico para Built In (tech job aggregator)
 *
 * Built In funciona como agregador de vagas tech
 * URL Pattern: https://builtin.com/jobs?companyId=COMPANY_ID&remote=true
 *
 * Estratégia:
 * 1. Busca vagas por company ID (similar a outros scrapers)
 * 2. Filtra apenas vagas remotas
 * 3. Extração via HTML parsing (cheerio)
 */
@Injectable()
export class BuiltInScraperService extends BaseScraperService {
  protected readonly logger = new Logger(BuiltInScraperService.name);
  protected readonly baseUrl = 'https://builtin.com';
  protected readonly platformName = 'builtin';

  // Configurações de rate limiting
  private readonly MAX_CONCURRENT_REQUESTS = 3; // Conservador para HTML scraping
  private readonly REQUEST_DELAY_MS = 1000;
  private readonly TIMEOUT_MS = 20000;

  // Estatísticas
  private stats = {
    totalCompanies: 0,
    successfulCompanies: 0,
    failedCompanies: 0,
    totalJobs: 0,
    remoteJobs: 0,
    errors: [] as { company: string; error: string }[],
  };

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas Built In
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Built In (multi-company)...');
    this.resetStats();

    // Verifica se o job board está habilitado
    const builtinBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'builtin', enabled: true },
    });

    if (!builtinBoard) {
      this.logger.warn('⚠️  Job board "builtin" não encontrado ou desabilitado');
      return [];
    }

    const companies = getVerifiedBuiltInCompanies();
    this.stats.totalCompanies = companies.length;

    this.logger.log(`📋 ${companies.length} empresas para processar`);

    const allJobs: ScrapedJob[] = [];

    // Processa empresas em batches
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
   * Busca vagas de uma empresa específica
   */
  private async fetchCompanyJobs(
    company: BuiltInCompany,
  ): Promise<ScrapedJob[]> {
    try {
      // URL com filtro de companyId e remote=true
      const jobsUrl = `${this.baseUrl}/jobs?companyId=${company.companyId}&remote=true&allLocations=true`;

      this.logger.debug(`🔍 Buscando ${company.name} (ID: ${company.companyId})...`);

      // Faz requisição HTTP
      const response = await firstValueFrom(
        this.httpService.get<string>(jobsUrl, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
          },
        }),
      );

      const html = response.data;

      // Extrai jobs do HTML
      const jobs = this.extractJobsFromHTML(html, company);

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
        error.response?.status === 404
          ? '404 - Empresa não encontrada'
          : error.response?.status === 403
            ? '403 - Acesso bloqueado'
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
   * Extrai jobs do HTML da página (dados vêm do JSON-LD schema)
   */
  private extractJobsFromHTML(
    html: string,
    company: BuiltInCompany,
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    try {
      const $ = cheerio.load(html);

      // Built In embute dados em JSON-LD (schema.org)
      const jsonLdScripts = $('script[type="application/ld+json"]');

      jsonLdScripts.each((_, scriptElement) => {
        try {
          const scriptContent = $(scriptElement).html();
          if (!scriptContent) return;

          const jsonData = JSON.parse(scriptContent);

          // Procura pelo ItemList no grafo
          if (jsonData['@graph']) {
            for (const item of jsonData['@graph']) {
              if (item['@type'] === 'ItemList' && item.itemListElement) {
                // Extrai jobs do itemListElement
                for (const jobItem of item.itemListElement) {
                  const job = this.transformBuiltInJsonJob(jobItem, company);
                  if (job) {
                    jobs.push(job);
                  }
                }
              }
            }
          }
        } catch (parseError) {
          // Ignora erros de parse (pode haver múltiplos scripts JSON-LD)
        }
      });

      if (jobs.length === 0) {
        this.logger.debug(`⚠️  ${company.name}: Nenhum job encontrado no JSON-LD`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao extrair jobs do HTML para ${company.name}: ${error.message}`,
      );
    }

    return jobs;
  }

  /**
   * Transforma job do JSON-LD (schema.org) em formato padrão
   */
  private transformBuiltInJsonJob(
    jobData: any,
    company: BuiltInCompany,
  ): ScrapedJob | null {
    try {
      if (jobData['@type'] !== 'ListItem') {
        return null;
      }

      const title = jobData.name || '';
      const jobUrl = jobData.url || '';
      const description = jobData.description || '';

      if (!title || !jobUrl) {
        return null; // Dados incompletos
      }

      // Extrai job ID da URL
      // Formato: https://builtin.com/job/specialist-solutions-architect-money-management/7629257
      let jobId = '';
      const match = jobUrl.match(/\/job\/[^\/]+\/(\d+)/);
      if (match) {
        jobId = match[1];
      }

      // Monta URL completa
      const externalUrl = jobUrl.startsWith('http')
        ? jobUrl
        : `${this.baseUrl}${jobUrl}`;

      // Verifica se é remoto baseado no título e descrição
      const titleLower = title.toLowerCase();
      const descriptionLower = description.toLowerCase();
      const isRemote =
        titleLower.includes('remote') ||
        descriptionLower.includes('remote') ||
        descriptionLower.includes('work from anywhere');

      return {
        externalId: `builtin-${company.companyId}-${jobId || Date.now()}`,
        platform: this.platformName,
        companySlug: company.slug,
        title: this.cleanText(title),
        description: this.cleanText(description),
        location: 'Remote', // Built In com filtro remote=true retorna apenas remotas
        remote: true, // Sempre true porque filtramos por remote=true na URL
        countries: [],
        tags: this.extractTagsFromTitle(title),
        seniority: this.inferSeniority(title),
        employmentType: 'full-time',
        requirements: [],
        benefits: [],
        externalUrl: externalUrl,
        publishedAt: new Date(),
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

    // Fallback: checa keywords em location e title
    const location = job.location?.toLowerCase() || '';
    const title = job.title?.toLowerCase() || '';

    const remoteKeywords = [
      'remote',
      'anywhere',
      'work from home',
      'wfh',
      'distributed',
      'virtual',
    ];

    return remoteKeywords.some(
      (keyword) => location.includes(keyword) || title.includes(keyword),
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
   * Converte string em slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
