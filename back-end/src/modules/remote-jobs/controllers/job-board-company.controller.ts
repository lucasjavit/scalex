import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JobBoardCompanyService } from '../services/job-board-company.service';

/**
 * Controller para gerenciar relações entre job boards e companies
 * Permite configurar quais empresas scrapar para cada plataforma
 */
@Controller('remote-jobs/job-board-companies')
export class JobBoardCompanyController {
  private readonly logger = new Logger(JobBoardCompanyController.name);

  constructor(private readonly jobBoardCompanyService: JobBoardCompanyService) {}

  /**
   * GET /remote-jobs/job-board-companies
   * Lista todas as relações
   */
  @Get()
  async findAll() {
    return this.jobBoardCompanyService.findAll();
  }

  /**
   * GET /remote-jobs/job-board-companies/enabled
   * Lista apenas relações ativas
   */
  @Get('enabled')
  async findEnabled() {
    return this.jobBoardCompanyService.findEnabled();
  }

  /**
   * GET /remote-jobs/job-board-companies/job-board/:jobBoardId
   * Lista companies para um job board específico
   */
  @Get('job-board/:jobBoardId')
  async findByJobBoard(@Param('jobBoardId') jobBoardId: string) {
    return this.jobBoardCompanyService.findByJobBoard(jobBoardId);
  }

  /**
   * GET /remote-jobs/job-board-companies/job-board/:jobBoardId/enabled
   * Lista companies ativas para um job board específico
   */
  @Get('job-board/:jobBoardId/enabled')
  async findEnabledByJobBoard(@Param('jobBoardId') jobBoardId: string) {
    return this.jobBoardCompanyService.findEnabledByJobBoard(jobBoardId);
  }

  /**
   * GET /remote-jobs/job-board-companies/company/:companyId
   * Lista job boards para uma company específica
   */
  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.jobBoardCompanyService.findByCompany(companyId);
  }

  /**
   * GET /remote-jobs/job-board-companies/:id
   * Busca uma relação específica
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobBoardCompanyService.findOne(id);
  }

  /**
   * POST /remote-jobs/job-board-companies
   * Cria uma nova relação job_board -> company
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body()
    body: {
      jobBoardId: string;
      companyId: string;
      scraperUrl: string;
      enabled?: boolean;
    },
  ) {
    this.logger.log(
      `Creating job_board_company: jobBoard=${body.jobBoardId}, company=${body.companyId}`,
    );

    return this.jobBoardCompanyService.create(body);
  }

  /**
   * POST /remote-jobs/job-board-companies/bulk
   * Cria múltiplas relações de uma vez
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createMany(
    @Body()
    body: {
      relations: Array<{
        jobBoardId: string;
        companyId: string;
        scraperUrl: string;
        enabled?: boolean;
      }>;
    },
  ) {
    this.logger.log(`Creating ${body.relations.length} job_board_company relations`);

    return this.jobBoardCompanyService.createMany(body.relations);
  }

  /**
   * PUT /remote-jobs/job-board-companies/:id
   * Atualiza uma relação existente
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      scraperUrl?: string;
      enabled?: boolean;
      scrapingStatus?: 'success' | 'error' | 'pending' | null;
      errorMessage?: string | null;
    },
  ) {
    this.logger.log(`Updating job_board_company: ${id}`);

    return this.jobBoardCompanyService.update(id, body);
  }

  /**
   * PUT /remote-jobs/job-board-companies/:id/scraping-status
   * Atualiza apenas o status de scraping
   */
  @Put(':id/scraping-status')
  async updateScrapingStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'success' | 'error' | 'pending';
      errorMessage?: string;
    },
  ) {
    return this.jobBoardCompanyService.updateScrapingStatus(
      id,
      body.status,
      body.errorMessage,
    );
  }

  /**
   * DELETE /remote-jobs/job-board-companies/:id
   * Remove uma relação
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Removing job_board_company: ${id}`);

    await this.jobBoardCompanyService.remove(id);
  }
}
