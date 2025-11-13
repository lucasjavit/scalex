import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from '../entities/saved-job.entity';
import { Job } from '../entities/job.entity';
import { ScrapedJob } from '../scrapers/base-scraper.service';
import * as crypto from 'crypto';

@Injectable()
export class SavedJobService {
  private readonly logger = new Logger(SavedJobService.name);

  constructor(
    @InjectRepository(SavedJob)
    private readonly savedJobRepository: Repository<SavedJob>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Salva uma vaga para o usuário
   * 1. Verifica se vaga já existe no PostgreSQL (tabela jobs)
   * 2. Se não existir, cria registro na tabela jobs
   * 3. Cria registro em saved_jobs
   */
  async saveJob(userId: string, scrapedJob: ScrapedJob): Promise<SavedJob> {
    this.logger.log(`💾 Salvando vaga para usuário ${userId}...`);

    // 1. Verifica se vaga existe no PostgreSQL (tabela jobs)
    let job = await this.jobRepository.findOne({
      where: {
        externalId: scrapedJob.externalId,
        platform: scrapedJob.platform,
      },
    });

    if (!job) {
      // Cria hash para deduplicação
      const hash = this.generateHash(scrapedJob);

      job = this.jobRepository.create({
        externalId: scrapedJob.externalId,
        platform: scrapedJob.platform,
        companySlug: undefined, // Set to undefined for now (companies not yet implemented)
        title: scrapedJob.title,
        description: scrapedJob.description,
        location: scrapedJob.location,
        salary: scrapedJob.salary,
        remote: scrapedJob.remote,
        countries: scrapedJob.countries,
        tags: scrapedJob.tags,
        seniority: scrapedJob.seniority,
        employmentType: scrapedJob.employmentType,
        requirements: scrapedJob.requirements,
        benefits: scrapedJob.benefits,
        externalUrl: scrapedJob.externalUrl,
        publishedAt: scrapedJob.publishedAt,
        scrapedAt: new Date(),
        status: 'active',
        hash,
      });

      job = await this.jobRepository.save(job);
      this.logger.log(`✅ Vaga copiada para PostgreSQL: ${job.id}`);
    }

    // 2. Verifica se já está salva (agora que temos o job.id)
    const existing = await this.savedJobRepository.findOne({
      where: {
        userId,
        jobId: job.id,
      },
    });

    if (existing) {
      this.logger.warn(`⚠️  Vaga já estava salva`);
      return existing;
    }

    // 3. Cria saved_job
    const savedJob = await this.savedJobRepository.save({
      userId,
      jobId: job.id,
      status: 'saved',
    });

    this.logger.log(`✅ Vaga salva com sucesso: ${savedJob.id}`);
    return savedJob;
  }

  /**
   * Lista todas as vagas salvas do usuário
   */
  async findAllByUser(userId: string): Promise<SavedJob[]> {
    return this.savedJobRepository.find({
      where: { userId },
      relations: ['job', 'job.company'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca uma vaga salva específica
   */
  async findOne(userId: string, savedJobId: string): Promise<SavedJob> {
    const savedJob = await this.savedJobRepository.findOne({
      where: { id: savedJobId, userId },
      relations: ['job', 'job.company'],
    });

    if (!savedJob) {
      throw new NotFoundException('Vaga salva não encontrada');
    }

    return savedJob;
  }

  /**
   * Atualiza status de uma vaga salva
   */
  async updateStatus(
    userId: string,
    savedJobId: string,
    status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted',
    notes?: string,
  ): Promise<SavedJob> {
    const savedJob = await this.findOne(userId, savedJobId);

    savedJob.status = status;
    if (notes !== undefined) {
      savedJob.notes = notes;
    }
    if (status === 'applied' && !savedJob.appliedAt) {
      savedJob.appliedAt = new Date();
    }

    return this.savedJobRepository.save(savedJob);
  }

  /**
   * Remove uma vaga salva
   */
  async remove(userId: string, savedJobId: string): Promise<void> {
    const savedJob = await this.findOne(userId, savedJobId);
    await this.savedJobRepository.remove(savedJob);
    this.logger.log(`🗑️  Vaga removida: ${savedJobId}`);
  }

  /**
   * Gera hash SHA-256 para deduplicação de vagas
   */
  private generateHash(job: ScrapedJob): string {
    const data = `${job.externalId}|${job.platform}|${job.title}|${job.companySlug}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
