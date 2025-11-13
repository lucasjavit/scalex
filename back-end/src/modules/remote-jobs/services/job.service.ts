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
   */
  async upsertJobs(jobs: any[]): Promise<Job[]> {
    if (!jobs || jobs.length === 0) {
      return [];
    }

    try {
      // Usar upsert (INSERT ... ON CONFLICT UPDATE) para cada job
      const savedJobs: Job[] = [];

      for (const jobData of jobs) {
        // Resolve companyId from companySlug if needed
        let companyId = jobData.companyId;

        if (!companyId && jobData.companySlug) {
          const company = await this.jobRepository.manager
            .getRepository('Company')
            .findOne({ where: { slug: jobData.companySlug }, select: ['id'] });

          if (company) {
            companyId = company.id;
          }
        }

        const job = await this.jobRepository.save({
          ...jobData,
          companyId, // Set companyId (proper FK using PK)
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

  /**
   * Busca job por externalId e platform
   */
  async findByExternalId(externalId: string, platform: string): Promise<Job | null> {
    return this.jobRepository.findOne({
      where: { externalId, platform },
    });
  }

  /**
   * Busca jobs de uma empresa específica
   */
  async getJobsByCompany(companySlug: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: {
        companySlug,
        isActive: true,
        status: 'active'
      },
      order: { publishedAt: 'DESC' },
    });
  }
}
