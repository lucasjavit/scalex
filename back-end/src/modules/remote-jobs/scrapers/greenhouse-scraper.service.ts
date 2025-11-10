import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { JobBoardCompanyService } from '../services/job-board-company.service';
import { Company } from '../entities/company.entity';
import { firstValueFrom } from 'rxjs';

/**
 * Interface para resposta da API do Greenhouse
 */
interface GreenhouseJob {
  id: number;
  internal_job_id: number;
  title: string;
  updated_at: string;
  location: {
    name: string;
  };
  absolute_url: string;
  metadata: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
  offices: Array<{
    id: number;
    name: string;
    location: string;
  }>;
  content?: string;
  employment_type?: string;
}

interface GreenhouseApiResponse {
  jobs: GreenhouseJob[];
}

/**
 * Scraper específico para Greenhouse.io
 *
 * O Greenhouse não é um agregador - cada empresa tem seu próprio endpoint.
 * Este scraper itera sobre uma lista curada de empresas conhecidas que
 * usam Greenhouse e busca vagas de cada uma.
 *
 * URL Pattern: https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs
 */
@Injectable()
export class GreenhouseScraperService extends BaseScraperService {
  protected readonly logger = new Logger(GreenhouseScraperService.name);
  protected readonly baseUrl = 'https://boards-api.greenhouse.io/v1/boards';
  protected readonly platformName = 'greenhouse';

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

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    private readonly jobBoardCompanyService: JobBoardCompanyService,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas Greenhouse
   * MODIFICADO: Agora busca empresas do banco de dados
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Greenhouse (multi-company)...');
    this.resetStats();

    // 1. Buscar o job_board "greenhouse"
    const greenhouseBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'greenhouse', enabled: true },
    });

    if (!greenhouseBoard) {
      this.logger.warn('⚠️  Job board "greenhouse" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar todas as empresas ATIVAS relacionadas ao greenhouse
    const relations = await this.jobBoardCompanyService
      .findEnabledByJobBoard(greenhouseBoard.id);

    if (relations.length === 0) {
      this.logger.warn('⚠️  Nenhuma empresa ativa encontrada para Greenhouse');
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

      const url = `${this.baseUrl}/${company.slug}/jobs`;
      this.logger.debug(`🔍 Buscando ${company.name} (${company.slug})...`);

      const response = await firstValueFrom(
        this.httpService.get<GreenhouseApiResponse>(url, {
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

      // Filtra apenas vagas remotas
      const remoteJobs = jobs.filter((job) => this.isRemoteJob(job));

      this.logger.log(
        `✅ ${company.name}: ${remoteJobs.length}/${jobs.length} vagas remotas`,
      );

      this.stats.successfulCompanies++;
      this.stats.totalJobs += jobs.length;
      this.stats.remoteJobs += remoteJobs.length;

      // Marcar como sucesso
      await this.jobBoardCompanyService.updateScrapingStatus(
        relation.id,
        'success',
      );

      // Transforma em formato padrão
      return remoteJobs.map((job) => this.transformGreenhouseJob(job, company));
    } catch (error) {
      const errorMessage = error.response?.status === 404
        ? '404 - Empresa não encontrada ou não usa mais Greenhouse'
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
      const url = `${this.baseUrl}/${company.slug}/jobs`;

      this.logger.debug(`🔍 Buscando ${company.name} (${company.slug})...`);

      const response = await firstValueFrom(
        this.httpService.get<GreenhouseApiResponse>(url, {
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

      // Filtra apenas vagas remotas
      const remoteJobs = jobs.filter((job) => this.isRemoteJob(job));

      this.logger.log(
        `✅ ${company.name}: ${remoteJobs.length}/${jobs.length} vagas remotas`,
      );

      this.stats.successfulCompanies++;
      this.stats.totalJobs += jobs.length;
      this.stats.remoteJobs += remoteJobs.length;

      // Transforma em formato padrão
      return remoteJobs.map((job) => this.transformGreenhouseJob(job, company));
    } catch (error) {
      const errorMessage = error.response?.status === 404
        ? '404 - Empresa não encontrada ou não usa mais Greenhouse'
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
  private isRemoteJob(job: GreenhouseJob): boolean {
    const locationName = job.location?.name?.toLowerCase() || '';

    // Palavras-chave que indicam remote
    const remoteKeywords = [
      'remote',
      'anywhere',
      'work from home',
      'wfh',
      'distributed',
      'virtual',
      'telecommute',
    ];

    return remoteKeywords.some((keyword) => locationName.includes(keyword));
  }

  /**
   * Transforma job do Greenhouse em formato padrão
   * MODIFICADO: Aceita Company entity do banco de dados
   */
  private transformGreenhouseJob(
    job: GreenhouseJob,
    company: Company,
  ): ScrapedJob {
    // Extrai department name
    const department = job.departments?.[0]?.name || '';

    // Extrai location
    const location = job.location?.name || 'Remote';

    // Extrai descrição dos metadados
    const description = this.extractDescription(job);

    // Extrai tags/skills dos metadados
    const tags = this.extractJobTags(job, department);

    return {
      externalId: `greenhouse-${company.slug}-${job.id}`,
      platform: this.platformName,
      companySlug: company.slug,
      title: this.cleanText(job.title),
      description: description,
      location: location,
      salary: undefined, // Greenhouse API não retorna salary por padrão
      remote: true,
      countries: [], // Poderia ser extraído da location
      tags: tags,
      seniority: this.inferSeniority(job.title),
      employmentType: this.mapEmploymentType(job.employment_type),
      requirements: [],
      benefits: [],
      externalUrl: job.absolute_url,
      publishedAt: new Date(job.updated_at),
    };
  }

  /**
   * Extrai descrição dos metadados ou usa título
   */
  private extractDescription(job: GreenhouseJob): string {
    // Se tiver content, usa ele
    if (job.content) {
      return this.cleanText(job.content);
    }

    // Senão, monta descrição baseada nos dados disponíveis
    const parts: string[] = [job.title];

    if (job.departments?.length > 0) {
      parts.push(`Department: ${job.departments.map((d) => d.name).join(', ')}`);
    }

    if (job.offices?.length > 0) {
      parts.push(`Office: ${job.offices.map((o) => o.name).join(', ')}`);
    }

    return parts.join(' | ');
  }

  /**
   * Extrai tags/skills dos metadados e department (método específico do Greenhouse)
   */
  private extractJobTags(job: GreenhouseJob, department: string): string[] {
    const tags: string[] = [];

    // Adiciona department como tag
    if (department) {
      tags.push(department);
    }

    // Adiciona metadados relevantes
    if (job.metadata) {
      for (const meta of job.metadata) {
        if (
          meta.name.toLowerCase().includes('skill') ||
          meta.name.toLowerCase().includes('technology')
        ) {
          tags.push(meta.value);
        }
      }
    }

    // Infere skills do título
    const titleLower = job.title.toLowerCase();
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
      'mobile',
      'ios',
      'android',
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
