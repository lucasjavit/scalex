import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import {
  getVerifiedLeverCompanies,
  LeverCompany,
} from '../config/lever-companies';
import { firstValueFrom } from 'rxjs';

/**
 * Interface para resposta da API do Lever
 */
interface LeverJob {
  id: string;
  text: string; // Job title
  categories: {
    commitment?: string; // Full-time, Part-time, etc
    department?: string;
    level?: string;
    location?: string;
    team?: string;
  };
  description: string;
  descriptionPlain?: string;
  lists: Array<{
    text: string;
    content: string;
  }>;
  additional?: string;
  additionalPlain?: string;
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;
}

/**
 * Scraper específico para Lever.co
 *
 * O Lever não é um agregador - cada empresa tem seu próprio endpoint.
 * Este scraper itera sobre uma lista curada de empresas conhecidas que
 * usam Lever e busca vagas de cada uma.
 *
 * URL Pattern: https://api.lever.co/v0/postings/{company_slug}?mode=json
 */
@Injectable()
export class LeverScraperService extends BaseScraperService {
  protected readonly logger = new Logger(LeverScraperService.name);
  protected readonly baseUrl = 'https://api.lever.co/v0/postings';
  protected readonly platformName = 'lever';

  // Configurações de rate limiting
  private readonly MAX_CONCURRENT_REQUESTS = 5;
  private readonly REQUEST_DELAY_MS = 500;
  private readonly TIMEOUT_MS = 10000;

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
   * Método principal: busca vagas de todas as empresas Lever
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Lever (multi-company)...');
    this.resetStats();

    const companies = getVerifiedLeverCompanies();
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
   * Busca vagas de uma empresa específica
   */
  private async fetchCompanyJobs(company: LeverCompany): Promise<ScrapedJob[]> {
    try {
      const url = `${this.baseUrl}/${company.slug}?mode=json`;

      this.logger.debug(`🔍 Buscando ${company.name} (${company.slug})...`);

      const response = await firstValueFrom(
        this.httpService.get<LeverJob[]>(url, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
        }),
      );

      const jobs = response.data || [];

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

      // Transforma em formato padrão
      return remoteJobs.map((job) => this.transformLeverJob(job, company));
    } catch (error) {
      const errorMessage =
        error.response?.status === 404
          ? '404 - Empresa não encontrada ou não usa mais Lever'
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
   * Verifica se uma vaga é remota
   */
  private isRemoteJob(job: LeverJob): boolean {
    const location = job.categories?.location?.toLowerCase() || '';
    const title = job.text?.toLowerCase() || '';
    const description = job.descriptionPlain?.toLowerCase() || '';

    // Palavras-chave que indicam remote
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
   * Transforma job do Lever em formato padrão
   */
  private transformLeverJob(
    job: LeverJob,
    company: LeverCompany,
  ): ScrapedJob {
    // Extrai informações das categorias
    const department = job.categories?.department || '';
    const level = job.categories?.level || '';
    const location = job.categories?.location || 'Remote';
    const commitment = job.categories?.commitment || '';

    // Monta descrição
    const description = this.extractDescription(job);

    // Extrai tags
    const tags = this.extractJobTags(job, department, level);

    return {
      externalId: `lever-${company.slug}-${job.id}`,
      platform: this.platformName,
      companySlug: company.slug,
      title: this.cleanText(job.text),
      description: description,
      location: location,
      salary: undefined, // Lever API não retorna salary por padrão
      remote: true,
      countries: [],
      tags: tags,
      seniority: this.inferSeniority(job.text),
      employmentType: this.mapEmploymentType(commitment),
      requirements: [],
      benefits: [],
      externalUrl: job.hostedUrl,
      publishedAt: new Date(job.createdAt),
    };
  }

  /**
   * Extrai descrição completa do job
   */
  private extractDescription(job: LeverJob): string {
    // Prioriza texto plano
    if (job.descriptionPlain) {
      return this.cleanText(job.descriptionPlain);
    }

    // Senão usa HTML
    if (job.description) {
      return this.cleanText(job.description);
    }

    // Última opção: apenas o título
    return job.text;
  }

  /**
   * Extrai tags/skills
   */
  private extractJobTags(
    job: LeverJob,
    department: string,
    level: string,
  ): string[] {
    const tags: string[] = [];

    // Adiciona department
    if (department) {
      tags.push(department);
    }

    // Adiciona level
    if (level) {
      tags.push(level);
    }

    // Adiciona team
    if (job.categories?.team) {
      tags.push(job.categories.team);
    }

    // Infere skills do título
    const titleLower = job.text.toLowerCase();
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
      'machine learning',
      'ml',
      'ai',
      'data',
    ];

    for (const skill of commonSkills) {
      if (titleLower.includes(skill)) {
        tags.push(skill);
      }
    }

    return [...new Set(tags)]; // Remove duplicatas
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
    this.logger.log(`📋 Total de empresas processadas: ${this.stats.totalCompanies}`);
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
