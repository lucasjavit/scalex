import {
  Controller,
  Post,
  Get,
  HttpCode,
  Logger,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { JobBoardAggregatorService } from '../services/job-board-aggregator.service';

@Controller('remote-jobs/job-boards')
export class JobBoardController {
  private readonly logger = new Logger(JobBoardController.name);

  constructor(
    private readonly jobBoardAggregatorService: JobBoardAggregatorService,
  ) {}

  /**
   * POST /remote-jobs/job-boards/scrape-all
   * Dispara scraping de TODOS os job boards habilitados
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-all')
  @HttpCode(200)
  async scrapeAllJobBoards() {
    this.logger.log('🚀 Endpoint /scrape-all chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreAllJobs();

    return {
      success: true,
      message: 'Scraping de job boards concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * GET /remote-jobs/job-boards/stats
   * Retorna estatísticas do último scraping
   */
  @Get('stats')
  async getScrapingStats() {
    const stats = await this.jobBoardAggregatorService.getScrapingStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-greenhouse
   * Dispara scraping APENAS de empresas Greenhouse
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-greenhouse')
  @HttpCode(200)
  async scrapeGreenhouseOnly() {
    this.logger.log('🏢 Endpoint /scrape-greenhouse chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreGreenhouseJobs();

    return {
      success: true,
      message: 'Scraping do Greenhouse concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-lever
   * Dispara scraping APENAS de empresas Lever
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-lever')
  @HttpCode(200)
  async scrapeLeverOnly() {
    this.logger.log('⚙️ Endpoint /scrape-lever chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreLeverJobs();

    return {
      success: true,
      message: 'Scraping do Lever concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-workable
   * Dispara scraping APENAS de empresas Workable
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-workable')
  @HttpCode(200)
  async scrapeWorkableOnly() {
    this.logger.log('🏗️ Endpoint /scrape-workable chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWorkableJobs();

    return {
      success: true,
      message: 'Scraping do Workable concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-ashby
   * Dispara scraping APENAS de empresas Ashby
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-ashby')
  @HttpCode(200)
  async scrapeAshbyOnly() {
    this.logger.log('🏛️ Endpoint /scrape-ashby chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreAshbyJobs();

    return {
      success: true,
      message: 'Scraping do Ashby concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-wellfound
   * Dispara scraping APENAS de empresas Wellfound
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-wellfound')
  @HttpCode(200)
  async scrapeWellfoundOnly() {
    this.logger.log('🌐 Endpoint /scrape-wellfound chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWellfoundJobs();

    return {
      success: true,
      message: 'Scraping do Wellfound concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-builtin
   * Dispara scraping APENAS de empresas Built In
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-builtin')
  @HttpCode(200)
  async scrapeBuiltInOnly() {
    this.logger.log('🏗️ Endpoint /scrape-builtin chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreBuiltInJobs();

    return {
      success: true,
      message: 'Scraping do Built In concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-weworkremotely
   * Dispara scraping APENAS do We Work Remotely (RSS feeds)
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-weworkremotely')
  @HttpCode(200)
  async scrapeWeWorkRemotelyOnly() {
    this.logger.log('💼 Endpoint /scrape-weworkremotely chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWeWorkRemotelyJobs();

    return {
      success: true,
      message: 'Scraping do We Work Remotely concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-remotive
   * Dispara scraping APENAS do Remotive (API pública)
   * Salva todas as vagas encontradas no Redis
   */
  @Post('scrape-remotive')
  @HttpCode(200)
  async scrapeRemotiveOnly() {
    this.logger.log('🌐 Endpoint /scrape-remotive chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreRemotiveJobs();

    return {
      success: true,
      message: 'Scraping do Remotive concluído e salvo no Redis',
      data: result,
    };
  }

  /**
   * GET /remote-jobs/job-boards/jobs
   * Retorna todas as vagas do Redis com filtros e paginação
   * Query params:
   *  - page: número da página (padrão: 1)
   *  - limit: itens por página (padrão: 20)
   *  - platform: filtrar por plataforma (lever, workable, etc)
   *  - remote: filtrar apenas vagas remotas (true/false)
   *  - seniority: filtrar por nível (junior, mid, senior, etc)
   *  - employmentType: filtrar por tipo (full-time, part-time, contract, internship)
   */
  @Get('jobs')
  async getAllJobs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('platform') platform?: string,
    @Query('remote', new ParseBoolPipe({ optional: true })) remote?: boolean,
    @Query('seniority') seniority?: string,
    @Query('employmentType') employmentType?: string,
  ) {
    const result = await this.jobBoardAggregatorService.getAllJobs({
      page,
      limit,
      platform,
      remote,
      seniority,
      employmentType,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * Endpoint para scraping APENAS do RemoteYeah
   */
  @Post('scrape-remoteyeah')
  @HttpCode(200)
  async scrapeRemoteYeahOnly() {
    this.logger.log('🌟 Endpoint /scrape-remoteyeah chamado');

    const result = await this.jobBoardAggregatorService.fetchAndStoreRemoteYeahJobs();

    return {
      success: true,
      message: 'Scraping do RemoteYeah concluído e salvo no Redis',
      data: result,
    };
  }
}

