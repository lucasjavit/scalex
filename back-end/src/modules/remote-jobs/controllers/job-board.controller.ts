import {
  Controller,
  Post,
  Get,
  HttpCode,
  Logger,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { JobBoardAggregatorService } from '../services/job-board-aggregator.service';
import { JobService } from '../services/job.service';

@Controller('remote-jobs/job-boards')
export class JobBoardController {
  private readonly logger = new Logger(JobBoardController.name);

  constructor(
    private readonly jobBoardAggregatorService: JobBoardAggregatorService,
    private readonly jobService: JobService,
  ) {}

  /**
   * POST /remote-jobs/job-boards/scrape-all
   * DEPRECATED: Scraping is now automatic via cron every 4 hours
   * Use this only for manual testing
   */
  @Post('scrape-all')
  @HttpCode(200)
  async scrapeAllJobBoards() {
    this.logger.log('🚀 Endpoint /scrape-all chamado (DEPRECATED - use cron)');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreAllJobs();

    return {
      success: true,
      message: 'Scraping manual executado (DEPRECATED - scraping automático a cada 4h)',
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
   * DEPRECATED: Scraping is now automatic via cron
   */
  @Post('scrape-greenhouse')
  @HttpCode(200)
  async scrapeGreenhouseOnly() {
    this.logger.log('🏢 Endpoint /scrape-greenhouse chamado (DEPRECATED)');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreGreenhouseJobs();

    return {
      success: true,
      message: 'DEPRECATED - Use cron automático a cada 4h',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-lever
   * Dispara scraping APENAS de empresas Lever
   */
  @Post('scrape-lever')
  @HttpCode(200)
  async scrapeLeverOnly() {
    this.logger.log('⚙️ Endpoint /scrape-lever chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreLeverJobs();

    return {
      success: true,
      message: 'Scraping do Lever concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-workable
   * Dispara scraping APENAS de empresas Workable
   */
  @Post('scrape-workable')
  @HttpCode(200)
  async scrapeWorkableOnly() {
    this.logger.log('🏗️ Endpoint /scrape-workable chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWorkableJobs();

    return {
      success: true,
      message: 'Scraping do Workable concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-ashby
   * Dispara scraping APENAS de empresas Ashby
   */
  @Post('scrape-ashby')
  @HttpCode(200)
  async scrapeAshbyOnly() {
    this.logger.log('🏛️ Endpoint /scrape-ashby chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreAshbyJobs();

    return {
      success: true,
      message: 'Scraping do Ashby concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-wellfound
   * Dispara scraping APENAS de empresas Wellfound
   */
  @Post('scrape-wellfound')
  @HttpCode(200)
  async scrapeWellfoundOnly() {
    this.logger.log('🌐 Endpoint /scrape-wellfound chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWellfoundJobs();

    return {
      success: true,
      message: 'Scraping do Wellfound concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-builtin
   * Dispara scraping APENAS de empresas Built In
   */
  @Post('scrape-builtin')
  @HttpCode(200)
  async scrapeBuiltInOnly() {
    this.logger.log('🏗️ Endpoint /scrape-builtin chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreBuiltInJobs();

    return {
      success: true,
      message: 'Scraping do Built In concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-weworkremotely
   * Dispara scraping APENAS do We Work Remotely (RSS feeds)
   */
  @Post('scrape-weworkremotely')
  @HttpCode(200)
  async scrapeWeWorkRemotelyOnly() {
    this.logger.log('💼 Endpoint /scrape-weworkremotely chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreWeWorkRemotelyJobs();

    return {
      success: true,
      message: 'Scraping do We Work Remotely concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * POST /remote-jobs/job-boards/scrape-remotive
   * Dispara scraping APENAS do Remotive (API pública)
   */
  @Post('scrape-remotive')
  @HttpCode(200)
  async scrapeRemotiveOnly() {
    this.logger.log('🌐 Endpoint /scrape-remotive chamado');

    const result =
      await this.jobBoardAggregatorService.fetchAndStoreRemotiveJobs();

    return {
      success: true,
      message: 'Scraping do Remotive concluído (DEPRECATED - use cron)',
      data: result,
    };
  }

  /**
   * GET /remote-jobs/job-boards/jobs/:id
   * Busca job por ID (deve vir ANTES da rota 'jobs' genérica)
   */
  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    const job = await this.jobService.findOne(id);

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  /**
   * GET /remote-jobs/job-boards/jobs
   * Retorna todas as vagas ativas do PostgreSQL com filtros e paginação
   * Query params:
   *  - page: número da página (padrão: 1)
   *  - limit: itens por página (padrão: 20)
   *  - platform: filtrar por plataforma (lever, workable, etc)
   *  - remote: filtrar apenas vagas remotas (true/false)
   *  - seniority: filtrar por nível (junior, mid, senior, etc)
   *  - employmentType: filtrar por tipo (full-time, part-time, contract, internship)
   *  - jobTitle: buscar por título da vaga
   *  - skills: buscar por habilidades/tags
   *  - benefits: buscar por benefícios
   *  - location: buscar por localização
   *  - minSalary: salário mínimo
   */
  @Get('jobs')
  async getAllJobs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('platform') platform?: string,
    @Query('remote', new ParseBoolPipe({ optional: true })) remote?: boolean,
    @Query('seniority') seniority?: string,
    @Query('employmentType') employmentType?: string,
    @Query('category') category?: string,
    @Query('jobTitle') jobTitle?: string,
    @Query('skills') skills?: string,
    @Query('benefits') benefits?: string,
    @Query('location') location?: string,
    @Query('degree') degree?: string,
    @Query('minSalary') minSalary?: string,
  ) {
    const result = await this.jobBoardAggregatorService.getAllJobs({
      page,
      limit,
      platform,
      remote,
      seniority,
      employmentType,
      category,
      jobTitle,
      skills,
      benefits,
      location,
      degree,
      minSalary,
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
      message: 'Scraping do RemoteYeah concluído (DEPRECATED - use cron)',
      data: result,
    };
  }
}

