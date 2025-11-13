import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SavedJobService } from '../services/saved-job.service';
import { JobService } from '../services/job.service';
import { ScrapedJob } from '../scrapers/base-scraper.service';

@Controller('remote-jobs/saved-jobs')
export class SavedJobController {
  private readonly logger = new Logger(SavedJobController.name);

  constructor(
    private readonly savedJobService: SavedJobService,
    private readonly jobService: JobService,
  ) {}

  /**
   * POST /remote-jobs/saved-jobs
   * Salva uma vaga para o usuário
   * Body: { userId, jobId (UUID da vaga no PostgreSQL) }
   */
  @Post()
  async saveJob(@Body() body: { userId: string; jobId: string }) {
    this.logger.log(`💾 Salvando vaga ${body.jobId} para usuário ${body.userId}`);

    // 1. Busca a vaga no PostgreSQL usando o UUID
    const job = await this.jobService.findOne(body.jobId);

    if (!job) {
      throw new NotFoundException('Vaga não encontrada no banco de dados');
    }

    // 2. Converte Job para ScrapedJob para manter compatibilidade
    const scrapedJob: ScrapedJob = {
      externalId: job.externalId,
      platform: job.platform,
      companySlug: job.companySlug || 'unknown',
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      remote: job.remote,
      countries: job.countries,
      tags: job.tags,
      seniority: job.seniority as any,
      employmentType: job.employmentType as any,
      requirements: job.requirements,
      benefits: job.benefits,
      externalUrl: job.externalUrl,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
    };

    // 3. Salva (cria saved_job)
    const savedJob = await this.savedJobService.saveJob(body.userId, scrapedJob);

    return {
      success: true,
      message: 'Vaga salva com sucesso',
      data: savedJob,
    };
  }

  /**
   * GET /remote-jobs/saved-jobs/:userId
   * Lista todas as vagas salvas do usuário
   */
  @Get(':userId')
  async findAll(@Param('userId') userId: string) {
    const savedJobs = await this.savedJobService.findAllByUser(userId);

    return {
      success: true,
      total: savedJobs.length,
      data: savedJobs,
    };
  }

  /**
   * GET /remote-jobs/saved-jobs/:userId/:savedJobId
   * Retorna uma vaga salva específica
   */
  @Get(':userId/:savedJobId')
  async findOne(
    @Param('userId') userId: string,
    @Param('savedJobId') savedJobId: string,
  ) {
    const savedJob = await this.savedJobService.findOne(userId, savedJobId);

    return {
      success: true,
      data: savedJob,
    };
  }

  /**
   * PATCH /remote-jobs/saved-jobs/:userId/:savedJobId
   * Atualiza status de uma vaga salva
   * Body: { status, notes }
   */
  @Patch(':userId/:savedJobId')
  async updateStatus(
    @Param('userId') userId: string,
    @Param('savedJobId') savedJobId: string,
    @Body()
    body: {
      status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted';
      notes?: string;
    },
  ) {
    const savedJob = await this.savedJobService.updateStatus(
      userId,
      savedJobId,
      body.status,
      body.notes,
    );

    return {
      success: true,
      message: 'Status atualizado com sucesso',
      data: savedJob,
    };
  }

  /**
   * DELETE /remote-jobs/saved-jobs/:userId/:savedJobId
   * Remove uma vaga salva
   */
  @Delete(':userId/:savedJobId')
  async remove(
    @Param('userId') userId: string,
    @Param('savedJobId') savedJobId: string,
  ) {
    await this.savedJobService.remove(userId, savedJobId);

    return {
      success: true,
      message: 'Vaga removida com sucesso',
    };
  }
}
