import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseScraperService, ScrapedJob } from './base-scraper.service';
import { JobBoard } from '../entities/job-board.entity';
import { RssFeed } from '../entities/rss-feed.entity';
import { RssFeedService } from '../services/rss-feed.service';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

/**
 * Scraper para We Work Remotely
 *
 * We Work Remotely usa RSS feeds para diferentes categorias
 * MODIFICADO: Agora busca RSS feeds do banco de dados
 *
 * Estratégia:
 * 1. Busca RSS feeds habilitados no banco de dados
 * 2. Parse XML usando cheerio
 * 3. Extrai jobs do feed
 */
@Injectable()
export class WeWorkRemotelyScraperService extends BaseScraperService {
  protected readonly logger = new Logger(WeWorkRemotelyScraperService.name);
  protected readonly baseUrl = 'https://weworkremotely.com';
  protected readonly platformName = 'weworkremotely';

  private readonly TIMEOUT_MS = 15000;

  // Estatísticas
  private stats = {
    totalFeeds: 0,
    successfulFeeds: 0,
    failedFeeds: 0,
    totalJobs: 0,
    errors: [] as { feed: string; error: string }[],
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
   * Método principal: busca vagas de todos os RSS feeds
   * MODIFICADO: Agora busca RSS feeds do banco de dados
   */
  async fetchJobs(): Promise<ScrapedJob[]> {
    this.logger.log('🚀 Iniciando scraping do We Work Remotely (RSS)...');
    this.resetStats();

    // 1. Buscar o job_board "weworkremotely"
    const weworkremotelyBoard = await this.jobBoardRepository.findOne({
      where: { slug: 'weworkremotely', enabled: true },
    });

    if (!weworkremotelyBoard) {
      this.logger.warn('⚠️  Job board "weworkremotely" não encontrado ou desabilitado');
      return [];
    }

    // 2. Buscar todos os RSS feeds ATIVOS do We Work Remotely
    const rssFeeds = await this.rssFeedService.findEnabledByJobBoard(
      weworkremotelyBoard.id,
    );

    if (rssFeeds.length === 0) {
      this.logger.warn('⚠️  Nenhum RSS feed ativo encontrado para We Work Remotely');
      return [];
    }

    this.stats.totalFeeds = rssFeeds.length;
    this.logger.log(`📋 ${rssFeeds.length} RSS feeds ativos para processar`);

    const allJobs: ScrapedJob[] = [];

    // Processa feeds em paralelo
    const feedResults = await Promise.all(
      rssFeeds.map((feed) => this.fetchFeedJobsFromRssFeed(feed)),
    );

    for (const jobs of feedResults) {
      allJobs.push(...jobs);
    }

    this.logStats();
    return allJobs;
  }

  /**
   * NOVO: Busca vagas de um RSS feed específico
   * Rastreia status (pending/success/error) no banco
   */
  private async fetchFeedJobsFromRssFeed(rssFeed: RssFeed): Promise<ScrapedJob[]> {
    try {
      // Marcar como "em processamento"
      await this.rssFeedService.updateScrapingStatus(rssFeed.id, 'pending');

      this.logger.debug(`🔍 Buscando feed: ${rssFeed.category}...`);

      const response = await firstValueFrom(
        this.httpService.get<string>(rssFeed.url, {
          timeout: this.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml',
          },
        }),
      );

      const xml = response.data;
      const jobs = this.parseRssFeed(xml);

      this.logger.log(`✅ ${rssFeed.category}: ${jobs.length} vagas`);

      this.stats.successfulFeeds++;
      this.stats.totalJobs += jobs.length;

      // Marcar como sucesso
      await this.rssFeedService.updateScrapingStatus(rssFeed.id, 'success');

      return jobs;
    } catch (error) {
      const errorMessage = error.response?.status || error.message;
      this.logger.warn(`❌ Feed ${rssFeed.category}: ${errorMessage}`);

      this.stats.failedFeeds++;
      this.stats.errors.push({
        feed: rssFeed.category,
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
   * Parse do RSS feed XML
   */
  private parseRssFeed(xml: string): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    try {
      const $ = cheerio.load(xml, { xmlMode: true });

      // Itera sobre cada <item> no RSS
      $('item').each((_, itemElement) => {
        const $item = $(itemElement);

        const title = $item.find('title').text().trim();
        const link = $item.find('link').text().trim();
        const description = $item.find('description').text().trim();
        const category = $item.find('category').text().trim();
        const region = $item.find('region').text().trim();
        const pubDate = $item.find('pubDate').text().trim();

        // Extrai company do título (formato: "Company: Job Title")
        const titleParts = title.split(':');
        const companyName = titleParts[0]?.trim() || 'Unknown';
        const jobTitle = titleParts.slice(1).join(':').trim() || title;

        // Extrai job ID da URL
        // Formato: https://weworkremotely.com/remote-jobs/close-senior-software-engineer-backend-python-usa-only-100-remote-1
        const urlParts = link.split('/');
        const jobSlug = urlParts[urlParts.length - 1] || '';

        // Parse data de publicação
        let publishedAt = new Date();
        try {
          if (pubDate) {
            publishedAt = new Date(pubDate);
          }
        } catch {
          // Usa data atual se parse falhar
        }

        // Tenta extrair salary da descrição (We Work Remotely menciona salary no texto)
        const salary = this.extractSalaryFromDescription(description);

        const job: ScrapedJob = {
          externalId: `weworkremotely-${jobSlug}`,
          platform: this.platformName,
          companySlug: this.slugify(companyName),
          title: this.cleanText(jobTitle),
          description: this.cleanText(this.stripHtmlTags(description)),
          location: region || 'Remote',
          salary: salary,
          remote: true, // We Work Remotely é só remote
          countries: [],
          tags: this.extractTagsFromText(jobTitle + ' ' + category),
          seniority: this.inferSeniority(jobTitle),
          employmentType: 'full-time',
          requirements: [],
          benefits: [],
          externalUrl: link,
          publishedAt: publishedAt,
        };

        jobs.push(job);
      });
    } catch (error) {
      this.logger.error(`Erro ao parsear RSS feed: ${error.message}`);
    }

    return jobs;
  }

  /**
   * Tenta extrair salary da descrição usando regex
   * We Work Remotely geralmente menciona salary no texto
   */
  private extractSalaryFromDescription(description: string): string | undefined {
    try {
      const text = this.stripHtmlTags(description);

      // Padrões comuns de salary
      // Exemplos: "$100k-$150k", "$100,000 - $150,000", "€50k-€70k", "100k-150k USD"
      const salaryPatterns = [
        /\$\d{1,3}(?:,\d{3})*(?:k)?\s*-\s*\$?\d{1,3}(?:,\d{3})*(?:k)?(?:\s*(?:USD|EUR|GBP))?/gi,
        /\€\d{1,3}(?:,\d{3})*(?:k)?\s*-\s*\€?\d{1,3}(?:,\d{3})*(?:k)?/gi,
        /£\d{1,3}(?:,\d{3})*(?:k)?\s*-\s*£?\d{1,3}(?:,\d{3})*(?:k)?/gi,
        /\d{1,3}(?:,\d{3})*(?:k)?\s*-\s*\d{1,3}(?:,\d{3})*(?:k)?\s*(?:USD|EUR|GBP)/gi,
      ];

      for (const pattern of salaryPatterns) {
        const match = text.match(pattern);
        if (match && match[0]) {
          return match[0].trim();
        }
      }
    } catch (error) {
      // Ignora erros de parsing
    }

    return undefined;
  }

  /**
   * Remove tags HTML de string
   */
  private stripHtmlTags(html: string): string {
    const $ = cheerio.load(html);
    return $.text();
  }

  /**
   * Extrai tags de texto (título + categoria)
   */
  private extractTagsFromText(text: string): string[] {
    const tags: string[] = [];
    const textLower = text.toLowerCase();

    const commonSkills = [
      'javascript',
      'typescript',
      'python',
      'java',
      'react',
      'node',
      'golang',
      'go',
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
      'ruby',
      'rails',
      'php',
      'c++',
      'c#',
      '.net',
    ];

    for (const skill of commonSkills) {
      if (textLower.includes(skill)) {
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
   * Reset das estatísticas
   */
  private resetStats(): void {
    this.stats = {
      totalFeeds: 0,
      successfulFeeds: 0,
      failedFeeds: 0,
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
    this.logger.log(`📋 Total de feeds processados: ${this.stats.totalFeeds}`);
    this.logger.log(`✅ Feeds com sucesso: ${this.stats.successfulFeeds}`);
    this.logger.log(`❌ Feeds com erro: ${this.stats.failedFeeds}`);
    this.logger.log(`💼 Total de vagas encontradas: ${this.stats.totalJobs}`);
    this.logger.log(
      `📈 Taxa de sucesso: ${((this.stats.successfulFeeds / this.stats.totalFeeds) * 100).toFixed(1)}%`,
    );

    if (this.stats.errors.length > 0) {
      this.logger.warn('');
      this.logger.warn('⚠️  Feeds com erro:');
      for (const error of this.stats.errors) {
        this.logger.warn(`   - ${error.feed}: ${error.error}`);
      }
    }

    this.logger.log('========================================================');
    this.logger.log('');
  }
}
