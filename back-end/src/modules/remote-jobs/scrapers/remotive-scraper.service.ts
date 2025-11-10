import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { firstValueFrom } from 'rxjs';

/**
 * Scraper para Remotive.io
 *
 * Remotive tem API pública documentada
 * API URL: https://remotive.com/api/remote-jobs?category=software-dev&limit=100
 * Documentação: https://remotive.com/remote-jobs/api
 *
 * Estratégia:
 * 1. Busca vagas via API pública (JSON)
 * 2. Filtra categorias relevantes (software-dev, devops, etc)
 * 3. Extração direta de JSON
 */
@Injectable()
export class RemotiveScraperService extends BaseScraperService {
  protected readonly logger = new Logger(RemotiveScraperService.name);
  protected readonly baseUrl = 'https://remotive.com/api/remote-jobs';
  protected readonly platformName = 'remotive';

  // Categorias para buscar
  private readonly CATEGORIES = [
    'software-dev',
    'devops',
    'data',
  ];

  private readonly LIMIT_PER_CATEGORY = 100;
  private readonly TIMEOUT_MS = 15000;

  // Estatísticas
  private stats = {
    totalCategories: 0,
    successfulCategories: 0,
    failedCategories: 0,
    totalJobs: 0,
    errors: [] as { category: string; error: string }[],
  };

  constructor(httpService: HttpService) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as categorias
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do Remotive (API)...');
    this.resetStats();

    this.stats.totalCategories = this.CATEGORIES.length;
    const allJobs: ScrapedJob[] = [];
    const seenIds = new Set<string>();

    // Processa categorias em paralelo
    const categoryResults = await Promise.all(
      this.CATEGORIES.map((category) => this.fetchCategoryJobs(category)),
    );

    // Remove duplicatas (jobs podem aparecer em múltiplas categorias)
    for (const jobs of categoryResults) {
      for (const job of jobs) {
        if (!seenIds.has(job.externalId)) {
          seenIds.add(job.externalId);
          allJobs.push(job);
        }
      }
    }

    this.logger.log(
      `🔍 Total de ${categoryResults.flat().length} vagas encontradas, ${allJobs.length} únicas`,
    );

    this.logStats();
    return allJobs;
  }

  /**
   * Busca vagas de uma categoria específica via API
   */
  private async fetchCategoryJobs(category: string): Promise<ScrapedJob[]> {
    try {
      const apiUrl = `${this.baseUrl}?category=${category}&limit=${this.LIMIT_PER_CATEGORY}`;

      this.logger.debug(`🔍 Buscando categoria: ${category}...`);

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

      const data = response.data;
      const jobs = this.transformRemotiveJobs(data.jobs || [], category);

      this.logger.log(`✅ ${category}: ${jobs.length} vagas`);

      this.stats.successfulCategories++;
      this.stats.totalJobs += jobs.length;

      return jobs;
    } catch (error) {
      const errorMessage = error.response?.status || error.message;
      this.logger.warn(`❌ Categoria ${category}: ${errorMessage}`);

      this.stats.failedCategories++;
      this.stats.errors.push({
        category: category,
        error: errorMessage,
      });

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
      totalCategories: 0,
      successfulCategories: 0,
      failedCategories: 0,
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
      `📋 Total de categorias processadas: ${this.stats.totalCategories}`,
    );
    this.logger.log(
      `✅ Categorias com sucesso: ${this.stats.successfulCategories}`,
    );
    this.logger.log(`❌ Categorias com erro: ${this.stats.failedCategories}`);
    this.logger.log(`💼 Total de vagas encontradas: ${this.stats.totalJobs}`);
    this.logger.log(
      `📈 Taxa de sucesso: ${((this.stats.successfulCategories / this.stats.totalCategories) * 100).toFixed(1)}%`,
    );

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Categorias com erro:');
      for (const error of this.stats.errors) {
        this.logger.warn(`   - ${error.category}: ${error.error}`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
