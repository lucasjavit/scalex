import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { JobBoardCompanyService } from '../services/job-board-company.service';
import { Company } from '../entities/company.entity';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

/**
 * Scraper específico para Workable
 *
 * O Workable usa JSON-LD (Schema.org JobPosting) nas páginas de carreiras.
 * Cada empresa tem sua própria página.
 *
 * URL Pattern: https://apply.workable.com/{company_slug}/
 */
@Injectable()
export class WorkableScraperService extends BaseScraperService {
  protected readonly logger = new Logger(WorkableScraperService.name);
  protected readonly baseUrl = 'https://apply.workable.com';
  protected readonly platformName = 'workable';

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

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    private readonly jobBoardCompanyService: JobBoardCompanyService,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas Workable
   * MODIFICADO: Agora busca empresas do banco de dados
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Workable (multi-company)...');
    this.resetStats();

    // 1. Buscar o job_board "workable"
    const workableBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'workable', enabled: true },
    });

    if (!workableBoard) {
      this.logger.warn('⚠️  Job board "workable" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar todas as empresas ATIVAS relacionadas ao workable
    const relations = await this.jobBoardCompanyService
      .findEnabledByJobBoard(workableBoard.id);

    if (relations.length === 0) {
      this.logger.warn('⚠️  Nenhuma empresa ativa encontrada para Workable');
      return [];
    }

    this.stats.totalCompanies = relations.length;
    this.logger.log(`📋 ${relations.length} empresas ativas para processar`);

    const allJobs: ScrapedJob[] = [];

    // Processa empresas em batches para não sobrecarregar
    for (let i = 0; i < relations.length; i += this.MAX_CONCURRENT_REQUESTS) {
      const batch = relations.slice(i, i + this.MAX_CONCURRENT_REQUESTS);

      this.logger.log(
        `📦 Processando batch ${Math.floor(i / this.MAX_CONCURRENT_REQUESTS) + 1}/${Math.ceil(relations.length / this.MAX_CONCURRENT_REQUESTS)}...`,
      );

      // Processa empresas do batch em paralelo
      const batchResults = await Promise.all(
        batch.map((relation) => this.fetchCompanyJobsFromRelation(relation)),
      );

      // Adiciona jobs encontrados
      for (const jobs of batchResults) {
        allJobs.push(...jobs);
      }

      // Delay entre batches
      if (i + this.MAX_CONCURRENT_REQUESTS < relations.length) {
        await this.delay(this.REQUEST_DELAY_MS);
      }
    }

    this.logStats();
    return allJobs;
  }

  /**
   * NOVO: Busca vagas de uma relação JobBoardCompany
   * Rastreia status (pending/success/error) no banco
   */
  private async fetchCompanyJobsFromRelation(relation: any): Promise<ScrapedJob[]> {
    const company = relation.company;

    try {
      // Marcar como "em processamento"
      await this.jobBoardCompanyService.updateScrapingStatus(
        relation.id,
        'pending',
      );

      const apiUrl = `https://apply.workable.com/api/v1/widget/accounts/${company.slug}`;
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

        // Marcar como sucesso
        await this.jobBoardCompanyService.updateScrapingStatus(
          relation.id,
          'success',
        );

        return [];
      }

      // Transforma em formato padrão (Workable já filtra apenas remoto)
      const scrapedJobs = jobs.map((job: any) =>
        this.transformWorkableJob(job, company),
      );

      this.logger.log(
        `✅ ${company.name}: ${scrapedJobs.length} vagas remotas`,
      );

      this.stats.successfulCompanies++;
      this.stats.totalJobs += jobs.length;
      this.stats.remoteJobs += scrapedJobs.length;

      // Marcar como sucesso
      await this.jobBoardCompanyService.updateScrapingStatus(
        relation.id,
        'success',
      );

      return scrapedJobs;
    } catch (error) {
      const errorMessage =
        error.response?.status === 404
          ? '404 - Empresa não encontrada ou não usa Workable'
          : error.message;

      this.logger.warn(`❌ ${company.name}: ${errorMessage}`);

      this.stats.failedCompanies++;
      this.stats.errors.push({
        company: company.name,
        error: errorMessage,
      });

      // Registrar erro no banco
      await this.jobBoardCompanyService.updateScrapingStatus(
        relation.id,
        'error',
        errorMessage,
      );

      return [];
    }
  }

  /**
   * ANTIGO: Busca vagas de uma empresa específica (mantido como fallback)
   * @deprecated Use fetchCompanyJobsFromRelation instead
   */
  private async fetchCompanyJobs_DEPRECATED(
    company: any,
  ): Promise<ScrapedJob[]> {
    try {
      // Workable Public Widget API
      const apiUrl = `https://apply.workable.com/api/v1/widget/accounts/${company.slug}`;

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
      const allJobs = jobs.map((job: any) => this.transformWorkableJob(job, company));

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
          ? '404 - Empresa não encontrada ou não usa Workable'
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
   * Transforma job da API do Workable em formato padrão
   * MODIFICADO: Aceita Company entity do banco de dados
   */
  private transformWorkableJob(
    job: any,
    company: Company,
  ): ScrapedJob {
    const title = job.title || '';
    const description = job.description || '';
    const location = job.city || job.country || 'Remote';
    const externalUrl = job.url || `https://apply.workable.com/j/${job.shortcode}`;
    const publishedAt = job.published_on ? new Date(job.published_on) : new Date();

    return {
      externalId: `workable-${company.slug}-${job.shortcode}`,
      platform: this.platformName,
      companySlug: company.slug,
      title: this.cleanText(title),
      description: this.cleanText(description),
      location: location,
      salary: undefined,
      remote: job.telecommuting || false,
      countries: job.country ? [job.country] : [],
      tags: this.extractTagsFromTitle(title),
      seniority: this.inferSeniority(title),
      employmentType: this.mapEmploymentType(job.employment_type),
      requirements: [],
      benefits: [],
      externalUrl: externalUrl,
      publishedAt: publishedAt,
    };
  }

  /**
   * Verifica se uma vaga é remota
   * Workable API já retorna o campo `telecommuting` que é mapeado para `remote`
   */
  private isRemoteJob(job: ScrapedJob): boolean {
    // Primeiro checa o campo explícito `remote` (vem de telecommuting)
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
