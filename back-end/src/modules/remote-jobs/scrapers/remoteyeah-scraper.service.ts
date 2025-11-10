import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

/**
 * Scraper para RemoteYeah
 *
 * RemoteYeah é um job board focado em vagas remotas para engenheiros
 * URL: https://remoteyeah.com
 *
 * Estratégia:
 * 1. Busca a página principal com listagem de vagas
 * 2. Parse HTML usando cheerio
 * 3. Extração de dados estruturados (JSON-LD se disponível)
 * 4. Paginação para buscar mais vagas
 */
@Injectable()
export class RemoteYeahScraperService extends BaseScraperService {
  protected readonly logger = new Logger(RemoteYeahScraperService.name);
  protected readonly baseUrl = 'https://remoteyeah.com';
  protected readonly platformName = 'remoteyeah';

  private readonly MAX_PAGES = 5; // Limita a 5 páginas para não sobrecarregar
  private readonly TIMEOUT_MS = 15000;

  // Estatísticas
  private stats = {
    totalPages: 0,
    successfulPages: 0,
    failedPages: 0,
    totalJobs: 0,
    errors: [] as { page: number; error: string }[],
  };

  constructor(
    httpService: HttpService,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
  ) {
    super(httpService);
  }

  /**
   * Método principal: busca vagas de todas as páginas
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do RemoteYeah (HTML)...');
    this.resetStats();

    // Verifica se o job board está habilitado
    const remoteyeahBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'remoteyeah', enabled: true },
    });

    if (!remoteyeahBoard) {
      this.logger.warn('⚠️  Job board "remoteyeah" não encontrado ou desabilitado');
      return [];
    }

    const allJobs: ScrapedJob[] = [];
    const seenIds = new Set<string>();

    // Busca múltiplas páginas
    for (let page = 1; page <= this.MAX_PAGES; page++) {
      this.stats.totalPages++;

      try {
        const jobs = await this.fetchPageJobs(page);

        // Remove duplicatas
        for (const job of jobs) {
          if (!seenIds.has(job.externalId)) {
            seenIds.add(job.externalId);
            allJobs.push(job);
          }
        }

        this.stats.successfulPages++;
        this.stats.totalJobs = allJobs.length;

        // Se não encontrou vagas, para de buscar mais páginas
        if (jobs.length === 0) {
          this.logger.log(`📄 Página ${page}: sem vagas, parando busca`);
          break;
        }

        this.logger.log(`📄 Página ${page}: ${jobs.length} vagas (${allJobs.length} únicas no total)`);

        // Pequeno delay entre requisições para ser gentil com o servidor
        await this.delay(1000);
      } catch (error) {
        const errorMessage = error.response?.status || error.message;
        this.logger.warn(`❌ Erro na página ${page}: ${errorMessage}`);

        this.stats.failedPages++;
        this.stats.errors.push({
          page,
          error: errorMessage,
        });

        // Se falhar 3 páginas seguidas, para
        if (this.stats.failedPages >= 3) {
          this.logger.warn('⚠️ Muitas falhas consecutivas, parando busca');
          break;
        }
      }
    }

    this.logStats();
    return allJobs;
  }

  /**
   * Busca vagas de uma página específica
   */
  private async fetchPageJobs(page: number): Promise<ScrapedJob[]> {
    const url = page === 1 ? this.baseUrl : `${this.baseUrl}?page=${page}`;

    this.logger.debug(`🔍 Buscando página ${page}...`);

    const html = await this.fetchHtml(url, this.TIMEOUT_MS);
    const $ = this.parseHtml(html);

    // Tenta extrair JSON-LD primeiro (se disponível)
    const jsonLdJobs = this.extractJsonLD($, 'JobPosting');
    if (jsonLdJobs.length > 0) {
      this.logger.debug(`📋 Encontrados ${jsonLdJobs.length} jobs via JSON-LD`);
      return this.transformJsonLdJobs(jsonLdJobs);
    }

    // Fallback: scraping HTML direto
    return this.scrapeHtmlJobs($);
  }

  /**
   * Transforma jobs do JSON-LD para formato padrão
   */
  private transformJsonLdJobs(jsonLdData: any[]): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    for (const jobData of jsonLdData) {
      try {
        const job: ScrapedJob = {
          externalId: `remoteyeah-${this.generateId(jobData.url || jobData.identifier)}`,
          platform: this.platformName,
          companySlug: this.extractCompanySlug(jobData.hiringOrganization?.name || 'Unknown'),
          title: this.cleanText(jobData.title),
          description: this.cleanText(jobData.description),
          location: jobData.jobLocation?.address?.addressCountry || 'Remote',
          salary: this.parseSalary(jobData.baseSalary),
          remote: true,
          countries: this.extractCountries(jobData.jobLocation),
          tags: this.extractTags(jobData.skills || jobData.relevantOccupation),
          seniority: this.inferSeniority(jobData.title),
          employmentType: this.mapEmploymentType(jobData.employmentType),
          requirements: [],
          benefits: [],
          externalUrl: this.normalizeUrl(jobData.url || ''),
          publishedAt: jobData.datePosted ? new Date(jobData.datePosted) : new Date(),
        };

        if (this.isValidJob(job)) {
          jobs.push(job);
        }
      } catch (error) {
        this.logger.error(`Erro ao transformar job JSON-LD: ${error.message}`);
      }
    }

    return jobs;
  }

  /**
   * Scraping direto do HTML (fallback)
   */
  private scrapeHtmlJobs($: cheerio.CheerioAPI): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // RemoteYeah usa cards de job - adaptar seletor conforme estrutura real
    $('.job-card, .job-item, [data-job], article[class*="job"]').each((_, element) => {
      try {
        const $job = $(element);

        // Extrai informações básicas (adaptar conforme HTML real)
        const title = $job.find('h2, h3, .job-title, [class*="title"]').first().text().trim();
        const company = $job.find('.company, [class*="company"]').first().text().trim();
        const location = $job.find('.location, [class*="location"]').first().text().trim();
        const description = $job.find('.description, [class*="description"]').first().text().trim();
        const jobUrl = $job.find('a[href*="/job"], a[href*="/jobs"]').first().attr('href') || '';
        const tags = $job.find('.tag, .skill, [class*="tag"], [class*="skill"]').map((_, el) => $(el).text().trim()).get();

        // Extrai data de publicação se disponível
        const dateText = $job.find('.date, [class*="date"], time').first().text().trim();
        let publishedAt = new Date();
        try {
          if (dateText) {
            publishedAt = this.parseRelativeDate(dateText);
          }
        } catch {
          // Usa data atual se parse falhar
        }

        if (!title || !company) {
          return; // Skip se não tem dados mínimos
        }

        const job: ScrapedJob = {
          externalId: `remoteyeah-${this.generateId(jobUrl)}`,
          platform: this.platformName,
          companySlug: this.extractCompanySlug(company),
          title: this.cleanText(title),
          description: this.cleanText(description),
          location: location || 'Remote',
          remote: true,
          countries: [],
          tags: tags.filter(Boolean),
          seniority: this.inferSeniority(title),
          employmentType: 'full-time',
          requirements: [],
          benefits: [],
          externalUrl: this.normalizeUrl(jobUrl),
          publishedAt: publishedAt,
        };

        if (this.isValidJob(job)) {
          jobs.push(job);
        }
      } catch (error) {
        this.logger.error(`Erro ao extrair job do HTML: ${error.message}`);
      }
    });

    return jobs;
  }

  /**
   * Parse de datas relativas ("2 days ago", "1 week ago")
   */
  private parseRelativeDate(dateText: string): Date {
    const now = new Date();
    const lowerText = dateText.toLowerCase();

    // "X days ago"
    const daysMatch = lowerText.match(/(\d+)\s+day/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1]);
      now.setDate(now.getDate() - days);
      return now;
    }

    // "X weeks ago"
    const weeksMatch = lowerText.match(/(\d+)\s+week/);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1]);
      now.setDate(now.getDate() - weeks * 7);
      return now;
    }

    // "X months ago"
    const monthsMatch = lowerText.match(/(\d+)\s+month/);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1]);
      now.setMonth(now.getMonth() - months);
      return now;
    }

    // "today" ou "yesterday"
    if (lowerText.includes('today')) {
      return now;
    }
    if (lowerText.includes('yesterday')) {
      now.setDate(now.getDate() - 1);
      return now;
    }

    return now;
  }

  /**
   * Delay helper para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset das estatísticas
   */
  private resetStats(): void {
    this.stats = {
      totalPages: 0,
      successfulPages: 0,
      failedPages: 0,
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
    this.logger.log(`📋 Total de páginas processadas: ${this.stats.totalPages}`);
    this.logger.log(`✅ Páginas com sucesso: ${this.stats.successfulPages}`);
    this.logger.log(`❌ Páginas com erro: ${this.stats.failedPages}`);
    this.logger.log(`💼 Total de vagas encontradas: ${this.stats.totalJobs}`);
    this.logger.log(
      `📈 Taxa de sucesso: ${((this.stats.successfulPages / this.stats.totalPages) * 100).toFixed(1)}%`,
    );

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Páginas com erro:');
      for (const error of this.stats.errors) {
        this.logger.warn(`   - Página ${error.page}: ${error.error}`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
