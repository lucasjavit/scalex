import { Controller, Get, Param } from '@nestjs/common';
import { JobService } from '../services/job.service';

@Controller('remote-jobs/jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * GET /api/remote-jobs/jobs/:id
   * Retorna detalhes de uma vaga específica
   */
  @Get(':id')
  async getJob(@Param('id') id: string) {
    const job = await this.jobService.findOne(id);

    return {
      success: true,
      data: job,
    };
  }

  // TODO: Adicionar mais endpoints conforme necessário
  // - GET /search (busca global com paginação)
  // - POST /:id/save (salvar vaga - requer autenticação)
  // - GET /saved (vagas salvas - requer autenticação)
}
