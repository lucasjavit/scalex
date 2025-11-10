import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Busca job por ID
   */
  async findOne(id: string): Promise<Job | null> {
    return this.jobRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  /**
   * Salva/atualiza jobs no banco usando upsert (necessário para SavedJob funcionar)
   * Redis é usado para cache de performance, mas jobs precisam estar no BD
   */
  async upsertJobs(jobs: any[]): Promise<Job[]> {
    if (!jobs || jobs.length === 0) {
      return [];
    }

    try {
      // Usar upsert (INSERT ... ON CONFLICT UPDATE) para cada job
      const savedJobs: Job[] = [];

      for (const jobData of jobs) {
        const job = await this.jobRepository.save({
          ...jobData,
          scrapedAt: new Date(),
          status: 'active',
        });
        savedJobs.push(job);
      }

      this.logger.log(`✅ ${savedJobs.length} jobs salvos/atualizados no BD`);
      return savedJobs;
    } catch (error) {
      this.logger.error(`❌ Erro ao salvar jobs no BD: ${error.message}`);
      throw error;
    }
  }

  /**
   * Busca jobs por company slug (usado para queries)
   */
  async findByCompany(companySlug: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { companySlug, status: 'active' },
      relations: ['company'],
      order: { publishedAt: 'DESC' },
    });
  }
}
