import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { RssFeed } from '../entities/rss-feed.entity';
import { RssFeedService } from '../services/rss-feed.service';
import { firstValueFrom } from 'rxjs';

/**
 * Scraper para Remotive.io
 *
 * Remotive tem API pública documentada
 * API URL: https://remotive.com/api/remote-jobs?category=software-dev&limit=100
 * Documentação: https://remotive.com/remote-jobs/api
 * MODIFICADO: Agora busca API endpoints do banco de dados
 *
 * Estratégia:
 * 1. Busca API endpoints habilitados no banco de dados
 * 2. Busca vagas via API pública (JSON)
 * 3. Extração direta de JSON
 */
@Injectable()
export class RemotiveScraperService extends BaseScraperService {
  protected readonly logger = new Logger(RemotiveScraperService.name);
  protected readonly baseUrl = 'https://remotive.com/api/remote-jobs';
  protected readonly platformName = 'remotive';

  private readonly TIMEOUT_MS = 15000;

  // Estatísticas
  private stats = {
    totalEndpoints: 0,
    successfulEndpoints: 0,
    failedEndpoints: 0,
    totalJobs: 0,
    errors: [] as { endpoint: string; error: string }[],
  };

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    private readonly rssFeedService: RssFeedService,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todos os API endpoints
   * MODIFICADO: Agora busca API endpoints do banco de dados
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Remotive (API)...');
    this.resetStats();

    // 1. Buscar o job_board "remotive"
    const remotiveBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'remotive', enabled: true },
    });

    if (!remotiveBoard) {
      this.logger.warn('⚠️  Job board "remotive" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar todos os API endpoints ATIVOS do Remotive
    const apiEndpoints = await this.rssFeedService.findEnabledByJobBoard(
      remotiveBoard.id,
    );

    if (apiEndpoints.length === 0) {
      this.logger.warn('⚠️  Nenhum API endpoint ativo encontrado para Remotive');
      return [];
    }

    this.stats.totalEndpoints = apiEndpoints.length;
    this.logger.log(`📋 ${apiEndpoints.length} API endpoints ativos para processar`);

    const allJobs: ScrapedJob[] = [];
    const seenIds = new Set<string>();

    // Processa endpoints em paralelo
    const endpointResults = await Promise.all(
      apiEndpoints.map((endpoint) => this.fetchEndpointJobs(endpoint)),
    );

    // Remove duplicatas (jobs podem aparecer em múltiplos endpoints)
    for (const jobs of endpointResults) {
      for (const job of jobs) {
        if (!seenIds.has(job.externalId)) {
          seenIds.add(job.externalId);
          allJobs.push(job);
        }
      }
    }

    this.logger.log(
      `🔍 Total de ${endpointResults.flat().length} vagas encontradas, ${allJobs.length} únicas`,
    );

    this.logStats();
    return allJobs;
  }

  /**
   * NOVO: Busca vagas de um API endpoint específico
   * Rastreia status (pending/success/error) no banco
   */
  private async fetchEndpointJobs(rssFeed: RssFeed): Promise<ScrapedJob[]> {
    try {
      // Marcar como "em processamento"
      await this.rssFeedService.updateScrapingStatus(rssFeed.id, 'pending');

      this.logger.debug(`🔍 Buscando endpoint: ${rssFeed.category}...`);

      const response = await firstValueFrom(
        this.httpService.get<any>(rssFeed.url, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
        }),
      );

      const data = response.data;
      const jobs = this.transformRemotiveJobs(data.jobs || [], rssFeed.category);

      this.logger.log(`✅ ${rssFeed.category}: ${jobs.length} vagas`);

      this.stats.successfulEndpoints++;
      this.stats.totalJobs += jobs.length;

      // Marcar como sucesso
      await this.rssFeedService.updateScrapingStatus(rssFeed.id, 'success');

      return jobs;
    } catch (error) {
      const errorMessage = error.response?.status || error.message;
      this.logger.warn(`❌ Endpoint ${rssFeed.category}: ${errorMessage}`);

      this.stats.failedEndpoints++;
      this.stats.errors.push({
        endpoint: rssFeed.category,
        error: errorMessage,
      });

      // Registrar erro no banco
      await this.rssFeedService.updateScrapingStatus(
        rssFeed.id,
        'error',
        errorMessage,
      );

      return [];
    }
  }

  /**
   * Transforma array de jobs da API Remotive em formato padrão
   */
  private transformRemotiveJobs(
    jobsData: any[],
    category: string,
  ): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    for (const jobData of jobsData) {
      try {
        // Extrai dados do job
        const id = jobData.id;
        const title = jobData.title || '';
        const companyName = jobData.company_name || 'Unknown';
        const companyLogo = jobData.company_logo || '';
        const location = jobData.candidate_required_location || 'Worldwide';
        const description = jobData.description || '';
        const jobType = jobData.job_type || 'full-time';
        const salary = jobData.salary || '';
        const url = jobData.url || '';
        const tags = jobData.tags || [];

        // Parse data de publicação
        let publishedAt = new Date();
        try {
          if (jobData.publication_date) {
            publishedAt = new Date(jobData.publication_date);
          }
        } catch {
          // Usa data atual se parse falhar
        }

        const job: ScrapedJob = {
          externalId: `remotive-${id}`,
          platform: this.platformName,
          companySlug: this.slugify(companyName),
          title: this.cleanText(title),
          description: this.cleanText(description),
          location: location,
          salary: salary || undefined,
          remote: true, // Remotive é só remote
          countries: [],
          tags: [...tags, category], // Adiciona categoria como tag
          seniority: this.inferSeniority(title),
          employmentType: this.mapEmploymentType(jobType),
          requirements: [],
          benefits: [],
          externalUrl: url,
          publishedAt: publishedAt,
        };

        jobs.push(job);
      } catch (error) {
        this.logger.error(
          `Erro ao transformar job ${jobData.id}: ${error.message}`,
        );
      }
    }

    return jobs;
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
   * Reset das estatísticas
   */
  private resetStats(): void {
    this.stats = {
      totalEndpoints: 0,
      successfulEndpoints: 0,
      failedEndpoints: 0,
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
    this.logger.log(
      `📋 Total de endpoints processados: ${this.stats.totalEndpoints}`,
    );
    this.logger.log(
      `✅ Endpoints com sucesso: ${this.stats.successfulEndpoints}`,
    );
    this.logger.log(`❌ Endpoints com erro: ${this.stats.failedEndpoints}`);
    this.logger.log(`💼 Total de vagas encontradas: ${this.stats.totalJobs}`);
    this.logger.log(
      `📈 Taxa de sucesso: ${((this.stats.successfulEndpoints / this.stats.totalEndpoints) * 100).toFixed(1)}%`,
    );

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Endpoints com erro:');
      for (const error of this.stats.errors) {
        this.logger.warn(`   - ${error.endpoint}: ${error.error}`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
