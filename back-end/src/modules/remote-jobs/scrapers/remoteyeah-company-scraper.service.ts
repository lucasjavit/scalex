import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { Company } from '../entities/company.entity';
import { JobBoard } from '../entities/job-board.entity';
import { JobBoardCompanyService } from '../services/job-board-company.service';
import * as cheerio from 'cheerio';

/**
 * Scraper para RemoteYeah baseado em empresas
 *
 * RemoteYeah tem páginas de empresas individuais
 * URL: https://remoteyeah.com/remote-companies/{slug}
 * MODIFICADO: Agora busca empresas do banco de dados
 *
 * Estratégia:
 * 1. Busca empresas da tabela companies com platform='remoteyeah'
 * 2. Para cada empresa, busca vagas na sua página
 * 3. Parse HTML usando cheerio
 */
@Injectable()
export class RemoteYeahCompanyScraperService extends BaseScraperService {
  protected readonly logger = new Logger(RemoteYeahCompanyScraperService.name);
  protected readonly baseUrl = 'https://remoteyeah.com/remote-companies';
  protected readonly platformName = 'remoteyeah';

  private readonly TIMEOUT_MS = 15000;
  private readonly BATCH_SIZE = 10;
  private readonly DELAY_BETWEEN_BATCHES_MS = 2000;

  // Estatísticas
  private stats = {
    totalCompanies: 0,
    successfulCompanies: 0,
    failedCompanies: 0,
    totalJobs: 0,
    errors: [] as { company: string; error: string }[],
  };

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly jobBoardCompanyService: JobBoardCompanyService,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as empresas
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do RemoteYeah por empresas...');
    this.resetStats();

    // 1. Buscar job board remoteyeah
    const remoteyeahBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'remoteyeah', enabled: true },
    });

    if (!remoteyeahBoard) {
      this.logger.warn('⚠️  Job board "remoteyeah" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar relações company-jobboard ativas
    const companyRelations = await this.jobBoardCompanyService.findByJobBoard(
      remoteyeahBoard.id,
    );

    if (companyRelations.length === 0) {
      this.logger.warn('⚠️  Nenhuma empresa ativa encontrada para RemoteYeah');
      return [];
    }

    this.stats.totalCompanies = companyRelations.length;
    this.logger.log(`📋 ${companyRelations.length} empresas ativas para processar`);

    const allJobs: ScrapedJob[] = [];

    // Processa empresas em batches
    for (let i = 0; i < companyRelations.length; i += this.BATCH_SIZE) {
      const batch = companyRelations.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(companyRelations.length / this.BATCH_SIZE);

      this.logger.log(`📦 Processando batch ${batchNumber}/${totalBatches}...`);

      const batchResults = await Promise.all(
        batch.map((relation) => this.fetchCompanyJobsFromRelation(relation)),
      );

      for (const jobs of batchResults) {
        allJobs.push(...jobs);
      }

      // Delay entre batches
      if (i + this.BATCH_SIZE < companyRelations.length) {
        await this.delay(this.DELAY_BETWEEN_BATCHES_MS);
      }
    }

    this.logStats();
    return allJobs;
  }

  /**
   * Busca vagas de uma empresa específica
   */
  private async fetchCompanyJobsFromRelation(relation: any): Promise<ScrapedJob[]> {
    const company = relation.company;

    try {
      // Marcar como "em processamento"
      await this.jobBoardCompanyService.updateScrapingStatus(relation.id, 'pending');

      this.logger.debug(`🔍 Buscando ${company.name}...`);

      const url = `${this.baseUrl}/${company.slug}`;
      const html = await this.fetchHtml(url, this.TIMEOUT_MS);
      const $ = cheerio.load(html);

      // Parse jobs da página
      const jobs = this.parseCompanyJobs($, company);

      this.logger.log(`✅ ${company.name}: ${jobs.length} vagas`);

      this.stats.successfulCompanies++;
      this.stats.totalJobs += jobs.length;

      // Marcar como sucesso
      await this.jobBoardCompanyService.updateScrapingStatus(relation.id, 'success');

      return jobs;
    } catch (error) {
      const errorMessage = error.response?.status || error.message;
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
   * Parse jobs da página da empresa
   */
  private parseCompanyJobs($: cheerio.CheerioAPI, company: Company): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // RemoteYeah usa cards/links para jobs
    // Vamos procurar links que apontam para /jobs/
    $('a[href*="/jobs/"]').each((_, element) => {
      try {
        const $job = $(element);
        const href = $job.attr('href');

        if (!href || !href.includes('/jobs/remote-')) return;

        // Tenta extrair informações do card
        const title = $job.find('h2, h3, .job-title, [class*="title"]').first().text().trim() ||
                     $job.text().trim();

        if (!title) return;

        // Extrai job ID da URL
        const jobSlug = href.split('/jobs/')[1] || '';
        const externalId = `remoteyeah-${jobSlug}`;

        // Verifica se já adicionamos este job
        if (jobs.find(j => j.externalId === externalId)) return;

        const job: ScrapedJob = {
          externalId,
          platform: this.platformName,
          companySlug: company.slug,
          title: this.cleanText(title),
          description: '', // Será preenchido no detalhe do job
          location: 'Remote',
          remote: true,
          countries: [],
          tags: [],
          seniority: this.inferSeniority(title),
          employmentType: 'full-time',
          requirements: [],
          benefits: [],
          externalUrl: href.startsWith('http') ? href : `https://remoteyeah.com${href}`,
          publishedAt: new Date(),
        };

        jobs.push(job);
      } catch (error) {
        this.logger.error(`Erro ao extrair job: ${error.message}`);
      }
    });

    return jobs;
  }

  /**
   * Delay helper
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
    if (this.stats.totalCompanies > 0) {
      this.logger.log(
        `📈 Taxa de sucesso: ${((this.stats.successfulCompanies / this.stats.totalCompanies) * 100).toFixed(1)}%`,
      );
    }

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Empresas com erro:');
      for (const error of this.stats.errors.slice(0, 10)) {
        this.logger.warn(`   - ${error.company}: ${error.error}`);
      }
      if (this.stats.errors.length > 10) {
        this.logger.warn(`   ... e mais ${this.stats.errors.length - 10} erros`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
