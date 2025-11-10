import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobBoardCompany } from '../entities/job-board-company.entity';

@Injectable()
export class JobBoardCompanyService {
  private readonly logger = new Logger(JobBoardCompanyService.name);

  constructor(
    @InjectRepository(JobBoardCompany)
    private readonly jobBoardCompanyRepository: Repository<JobBoardCompany>,
  ) {}

  /**
   * Lista todas as relações job_board -> company
   */
  async findAll(): Promise<JobBoardCompany[]> {
    return this.jobBoardCompanyRepository.find({
      relations: ['jobBoard', 'company'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Lista companies para um job board específico
   */
  async findByJobBoard(jobBoardId: string): Promise<JobBoardCompany[]> {
    return this.jobBoardCompanyRepository.find({
      where: { jobBoardId },
      relations: ['company'],
      order: {
        company: {
          name: 'ASC',
        },
      },
    });
  }

  /**
   * Lista job boards para uma company específica
   */
  async findByCompany(companyId: string): Promise<JobBoardCompany[]> {
    return this.jobBoardCompanyRepository.find({
      where: { companyId },
      relations: ['jobBoard'],
      order: {
        jobBoard: {
          name: 'ASC',
        },
      },
    });
  }

  /**
   * Busca uma relação específica
   */
  async findOne(id: string): Promise<JobBoardCompany> {
    const relation = await this.jobBoardCompanyRepository.findOne({
      where: { id },
      relations: ['jobBoard', 'company'],
    });

    if (!relation) {
      throw new NotFoundException(`JobBoardCompany with ID ${id} not found`);
    }

    return relation;
  }

  /**
   * Cria uma nova relação job_board -> company
   */
  async create(data: {
    jobBoardId: string;
    companyId: string;
    scraperUrl: string;
    enabled?: boolean;
  }): Promise<JobBoardCompany> {
    const jobBoardCompany = this.jobBoardCompanyRepository.create({
      jobBoardId: data.jobBoardId,
      companyId: data.companyId,
      scraperUrl: data.scraperUrl,
      enabled: data.enabled ?? true,
    });

    return this.jobBoardCompanyRepository.save(jobBoardCompany);
  }

  /**
   * Atualiza uma relação existente
   */
  async update(
    id: string,
    data: {
      scraperUrl?: string;
      enabled?: boolean;
      scrapingStatus?: 'success' | 'error' | 'pending' | null;
      errorMessage?: string | null;
    },
  ): Promise<JobBoardCompany> {
    const relation = await this.findOne(id);

    if (data.scraperUrl !== undefined) {
      relation.scraperUrl = data.scraperUrl;
    }

    if (data.enabled !== undefined) {
      relation.enabled = data.enabled;
    }

    if (data.scrapingStatus !== undefined) {
      relation.scrapingStatus = data.scrapingStatus;
    }

    if (data.errorMessage !== undefined) {
      relation.errorMessage = data.errorMessage;
    }

    return this.jobBoardCompanyRepository.save(relation);
  }

  /**
   * Atualiza o status de scraping
   */
  async updateScrapingStatus(
    id: string,
    status: 'success' | 'error' | 'pending',
    errorMessage?: string,
  ): Promise<JobBoardCompany> {
    const relation = await this.findOne(id);

    relation.scrapingStatus = status;
    relation.lastScrapedAt = new Date();
    relation.errorMessage = errorMessage || null;

    return this.jobBoardCompanyRepository.save(relation);
  }

  /**
   * Remove uma relação
   */
  async remove(id: string): Promise<void> {
    const relation = await this.findOne(id);
    await this.jobBoardCompanyRepository.remove(relation);
  }

  /**
   * Lista apenas relações ativas (enabled = true)
   */
  async findEnabled(): Promise<JobBoardCompany[]> {
    return this.jobBoardCompanyRepository.find({
      where: { enabled: true },
      relations: ['jobBoard', 'company'],
      order: {
        jobBoard: {
          priority: 'DESC',
        },
      },
    });
  }

  /**
   * Lista companies ativas para um job board específico
   */
  async findEnabledByJobBoard(jobBoardId: string): Promise<JobBoardCompany[]> {
    return this.jobBoardCompanyRepository.find({
      where: {
        jobBoardId,
        enabled: true,
      },
      relations: ['company'],
      order: {
        company: {
          name: 'ASC',
        },
      },
    });
  }

  /**
   * Busca relação por jobBoardId e companyId
   */
  async findByJobBoardAndCompany(
    jobBoardId: string,
    companyId: string,
  ): Promise<JobBoardCompany | null> {
    return this.jobBoardCompanyRepository.findOne({
      where: {
        jobBoardId,
        companyId,
      },
      relations: ['jobBoard', 'company'],
    });
  }

  /**
   * Cria múltiplas relações de uma vez
   */
  async createMany(
    data: Array<{
      jobBoardId: string;
      companyId: string;
      scraperUrl: string;
      enabled?: boolean;
    }>,
  ): Promise<JobBoardCompany[]> {
    const relations = data.map((item) =>
      this.jobBoardCompanyRepository.create({
        jobBoardId: item.jobBoardId,
        companyId: item.companyId,
        scraperUrl: item.scraperUrl,
        enabled: item.enabled ?? true,
      }),
    );

    return this.jobBoardCompanyRepository.save(relations);
  }
}
