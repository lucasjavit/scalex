import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Logger,
  Inject,
} from '@nestjs/common';
import { SavedJobService } from '../services/saved-job.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ScrapedJob } from '../scrapers/base-scraper.service';

@Controller('remote-jobs/saved-jobs')
export class SavedJobController {
  private readonly logger = new Logger(SavedJobController.name);

  constructor(
    private readonly savedJobService: SavedJobService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * POST /remote-jobs/saved-jobs
   * Salva uma vaga para o usuário
   * Body: { userId, jobId (externalId da vaga no Redis) }
   */
  @Post()
  async saveJob(
    @Body() body: { userId: string; jobId: string; platform: string },
  ) {
    this.logger.log(`💾 Salvando vaga ${body.jobId} para usuário ${body.userId}`);

    // 1. Busca a vaga no Redis
    const allJobs = await this.cacheManager.get<ScrapedJob[]>('jobs:all');

    if (!allJobs || allJobs.length === 0) {
      return {
        success: false,
        message: 'Nenhuma vaga encontrada no cache. Faça o scraping primeiro.',
      };
    }

    // 2. Encontra a vaga específica
    const scrapedJob = allJobs.find(
      (job) =>
        job.externalId === body.jobId && job.platform === body.platform,
    );

    if (!scrapedJob) {
      return {
        success: false,
        message: 'Vaga não encontrada no cache',
      };
    }

    // 3. Salva (copia para PostgreSQL + cria saved_job)
    const savedJob = await this.savedJobService.saveJob(
      body.userId,
      scrapedJob,
    );

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
