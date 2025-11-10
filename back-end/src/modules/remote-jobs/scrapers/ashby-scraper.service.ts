import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import {
  getVerifiedAshbyCompanies,
  AshbyCompany,
} from '../config/ashby-companies';
import { firstValueFrom } from 'rxjs';

/**
 * Scraper específico para AshbyHQ
 *
 * O Ashby usa uma API pública para listar vagas por empresa.
 * Cada empresa tem sua própria página de jobs.
 *
 * URL Pattern: https://jobs.ashbyhq.com/{company}/
 * API: https://api.ashbyhq.com/posting-api/job-board/{company}
 */
@Injectable()
export class AshbyScraperService extends BaseScraperService {
  protected readonly logger = new Logger(AshbyScraperService.name);
  protected readonly baseUrl = 'https://api.ashbyhq.com/posting-api/job-board';
  protected readonly platformName = 'ashby';

  // Configurações de rate limiting
  private readonly MAX_CONCURRENT_REQUESTS = 5;
  private readonly REQUEST_DELAY_MS = 500;
  private readonly TIMEOUT_MS = 15000;

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
   * Método principal: busca vagas de todas as empresas Ashby
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Ashby (multi-company)...');
    this.resetStats();

    const companies = getVerifiedAshbyCompanies();
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
   * Busca vagas de uma empresa específica usando API do Ashby
   */
  private async fetchCompanyJobs(
    company: AshbyCompany,
  ): Promise<ScrapedJob[]> {
    try {
      // Ashby Public API
      const apiUrl = `${this.baseUrl}/${company.slug}`;

      this.logger.debug(`🔍 Buscando ${company.name} (${company.slug})...`);

      const response = await firstValueFrom(
        this.httpService.get<any>(apiUrl, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
        }),
      );

      const jobs = response.data?.jobs || [];

      if (jobs.length === 0) {
        this.logger.debug(`⚪ ${company.name}: 0 vagas`);
        this.stats.successfulCompanies++;
        return [];
      }

      // Transforma em formato padrão
      const allJobs = jobs.map((job: any) =>
        this.transformAshbyJob(job, company),
      );

      // Filtra apenas vagas remotas
      const remoteJobs = allJobs.filter((job) => this.isRemoteJob(job));

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
          ? '404 - Empresa não encontrada ou não usa Ashby'
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
   * Transforma job da API do Ashby em formato padrão
   */
  private transformAshbyJob(job: any, company: AshbyCompany): ScrapedJob {
    const title = job.title || '';
    const description = job.descriptionPlain || job.descriptionHtml || '';
    const location = job.location || job.locationName || 'Remote';
    const externalUrl = job.jobUrl || `https://jobs.ashbyhq.com/${company.slug}/${job.id}`;
    const publishedAt = job.publishedAt ? new Date(job.publishedAt) : new Date();

    return {
      externalId: `ashby-${company.slug}-${job.id}`,
      platform: this.platformName,
      companySlug: company.slug,
      title: this.cleanText(title),
      description: this.cleanText(description),
      location: location,
      salary: undefined,
      remote: job.isRemote || false,
      countries: job.address?.postalAddress?.addressCountry
        ? [job.address.postalAddress.addressCountry]
        : [],
      tags: this.extractTagsFromTitle(title),
      seniority: this.inferSeniority(title),
      employmentType: this.mapEmploymentType(job.employmentType),
      requirements: [],
      benefits: [],
      externalUrl: externalUrl,
      publishedAt: publishedAt,
    };
  }

  /**
   * Verifica se uma vaga é remota
   * Ashby API já retorna o campo `isRemote`
   */
  private isRemoteJob(job: ScrapedJob): boolean {
    // Primeiro checa o campo explícito `remote` (vem de isRemote)
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
