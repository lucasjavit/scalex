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

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    private readonly jobBoardCompanyService: JobBoardCompanyService,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas Lever
   * MODIFICADO: Agora busca empresas do banco de dados
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Lever (multi-company)...');
    this.resetStats();

    // 1. Buscar o job_board "lever"
    const leverBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'lever', enabled: true },
    });

    if (!leverBoard) {
      this.logger.warn('⚠️  Job board "lever" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar todas as empresas ATIVAS relacionadas ao lever
    const relations = await this.jobBoardCompanyService
      .findEnabledByJobBoard(leverBoard.id);

    if (relations.length === 0) {
      this.logger.warn('⚠️  Nenhuma empresa ativa encontrada para Lever');
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
  private async fetchCompanyJobs_DEPRECATED(company: any): Promise<ScrapedJob[]> {
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
   * MELHORADO: Verifica location + title + description e aceita location vazia
   */
  private isRemoteJob(job: LeverJob): boolean {
    // 1. Verifica location
    const location = job.categories?.location?.toLowerCase() || '';

    // 2. Verifica título
    const title = job.text?.toLowerCase() || '';

    // 3. Verifica descrição (se disponível)
    const description = job.descriptionPlain?.toLowerCase() || '';

    // 4. Combina tudo para buscar
    const allText = `${location} ${title} ${description}`.toLowerCase();

    // Palavras-chave que indicam remote (mais abrangente)
    const remoteKeywords = [
      'remote',
      'anywhere',
      'work from home',
      'wfh',
      'distributed',
      'virtual',
      'telecommute',
      'home office',
      'trabalho remoto',
      'remoto',
    ];

    // Verifica se tem alguma palavra-chave
    const hasRemoteKeyword = remoteKeywords.some((keyword) => allText.includes(keyword));

    // Também aceita se location não está definido ou é vazio (algumas empresas só postam remote)
    const isEmptyLocation = !location || location.trim() === '';

    return hasRemoteKeyword || isEmptyLocation;
  }

  /**
   * Transforma job do Lever em formato padrão
   * MODIFICADO: Aceita Company entity do banco de dados
   */
  private transformLeverJob(
    job: LeverJob,
    company: Company,
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
