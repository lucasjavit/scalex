import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { JobBoard } from '../entities/job-board.entity';
import { JobBoardCompany } from '../entities/job-board-company.entity';
import { JobBoardAggregatorService } from './job-board-aggregator.service';

@Injectable()
export class RemoteJobsAdminService {
  private readonly logger = new Logger(RemoteJobsAdminService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(JobBoard)
    private readonly jobBoardRepository: Repository<JobBoard>,
    @InjectRepository(JobBoardCompany)
    private readonly jobBoardCompanyRepository: Repository<JobBoardCompany>,
    private readonly aggregatorService: JobBoardAggregatorService,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [totalCompanies, totalJobBoards, totalJobBoardCompanies] = await Promise.all([
      this.companyRepository.count(),
      this.jobBoardRepository.count(),
      this.jobBoardCompanyRepository.count(),
    ]);

    const enabledJobBoardCompanies = await this.jobBoardCompanyRepository.count({
      where: { enabled: true },
    });

    // Get scraping stats from PostgreSQL
    const scrapingStats = await this.aggregatorService.getScrapingStats();

    return {
      companies: {
        total: totalCompanies,
        byPlatform: await this.getCompaniesByPlatform(),
      },
      jobBoards: {
        total: totalJobBoards,
      },
      jobBoardCompanies: {
        total: totalJobBoardCompanies,
        enabled: enabledJobBoardCompanies,
        disabled: totalJobBoardCompanies - enabledJobBoardCompanies,
      },
      scraping: {
        lastRun: null, // Now handled by cron service automatically
        totalJobs: scrapingStats?.total || 0,
        byPlatform: scrapingStats?.byPlatform || {},
      },
    };
  }

  /**
   * Get companies grouped by platform
   */
  private async getCompaniesByPlatform() {
    const companies = await this.companyRepository
      .createQueryBuilder('company')
      .select('company.platform')
      .addSelect('COUNT(company.id)', 'count')
      .groupBy('company.platform')
      .getRawMany();

    const result: Record<string, number> = {};
    companies.forEach((item) => {
      result[item.company_platform] = parseInt(item.count);
    });

    return result;
  }

  /**
   * Get all companies with pagination
   */
  async getAllCompanies(filters: {
    page: number;
    limit: number;
    platform?: string;
    featured?: boolean;
  }) {
    const { page, limit, platform, featured } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.jobBoardCompanies', 'jbc')
      .leftJoinAndSelect('jbc.jobBoard', 'jb');

    if (platform) {
      queryBuilder.andWhere('company.platform = :platform', { platform });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere('company.featured = :featured', { featured });
    }

    const [companies, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('company.name', 'ASC')
      .getManyAndCount();

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string) {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['jobBoardCompanies', 'jobBoardCompanies.jobBoard'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  /**
   * Create new company
   */
  async createCompany(data: Partial<Company>) {
    const company = this.companyRepository.create(data);
    return await this.companyRepository.save(company);
  }

  /**
   * Update company
   */
  async updateCompany(id: string, data: Partial<Company>) {
    const company = await this.getCompanyById(id);
    Object.assign(company, data);
    return await this.companyRepository.save(company);
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string) {
    const company = await this.getCompanyById(id);
    await this.companyRepository.remove(company);
  }

  /**
   * Get all job boards
   */
  async getAllJobBoards() {
    return await this.jobBoardRepository.find({
      relations: ['jobBoardCompanies'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get job board companies with filters
   */
  async getJobBoardCompanies(filters: {
    jobBoardId?: string;
    companyId?: string;
    enabled?: boolean;
  }) {
    const { jobBoardId, companyId, enabled } = filters;

    const queryBuilder = this.jobBoardCompanyRepository
      .createQueryBuilder('jbc')
      .leftJoinAndSelect('jbc.jobBoard', 'jb')
      .leftJoinAndSelect('jbc.company', 'c');

    if (jobBoardId) {
      queryBuilder.andWhere('jbc.jobBoardId = :jobBoardId', { jobBoardId });
    }

    if (companyId) {
      queryBuilder.andWhere('jbc.companyId = :companyId', { companyId });
    }

    if (enabled !== undefined) {
      queryBuilder.andWhere('jbc.enabled = :enabled', { enabled });
    }

    return await queryBuilder
      .orderBy('jb.name', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .getMany();
  }

  /**
   * Create job board company
   */
  async createJobBoardCompany(data: Partial<JobBoardCompany>) {
    const jobBoardCompany = this.jobBoardCompanyRepository.create(data);
    return await this.jobBoardCompanyRepository.save(jobBoardCompany);
  }

  /**
   * Update job board company
   */
  async updateJobBoardCompany(id: string, data: Partial<JobBoardCompany>) {
    const jobBoardCompany = await this.jobBoardCompanyRepository.findOne({
      where: { id },
      relations: ['jobBoard', 'company'],
    });

    if (!jobBoardCompany) {
      throw new NotFoundException(`Job board company with ID ${id} not found`);
    }

    Object.assign(jobBoardCompany, data);
    return await this.jobBoardCompanyRepository.save(jobBoardCompany);
  }

  /**
   * Toggle job board company enabled status
   */
  async toggleJobBoardCompany(id: string) {
    const jobBoardCompany = await this.jobBoardCompanyRepository.findOne({
      where: { id },
      relations: ['jobBoard', 'company'],
    });

    if (!jobBoardCompany) {
      throw new NotFoundException(`Job board company with ID ${id} not found`);
    }

    jobBoardCompany.enabled = !jobBoardCompany.enabled;
    return await this.jobBoardCompanyRepository.save(jobBoardCompany);
  }

  /**
   * Delete job board company
   */
  async deleteJobBoardCompany(id: string) {
    const jobBoardCompany = await this.jobBoardCompanyRepository.findOne({
      where: { id },
    });

    if (!jobBoardCompany) {
      throw new NotFoundException(`Job board company with ID ${id} not found`);
    }

    await this.jobBoardCompanyRepository.remove(jobBoardCompany);
  }

  /**
   * Trigger scraping manually
   */
  async triggerScraping(platform?: string, companyId?: string) {
    this.logger.log(`Triggering scraping - platform: ${platform}, companyId: ${companyId}`);

    if (companyId) {
      // Scrape specific company
      // TODO: Implement single company scraping
      return {
        message: 'Single company scraping not yet implemented',
        companyId,
      };
    }

    if (platform) {
      // Scrape specific platform
      switch (platform.toLowerCase()) {
        case 'greenhouse':
          return await this.aggregatorService.fetchAndStoreGreenhouseJobs();
        case 'lever':
          return await this.aggregatorService.fetchAndStoreLeverJobs();
        case 'workable':
          return await this.aggregatorService.fetchAndStoreWorkableJobs();
        case 'ashby':
          return await this.aggregatorService.fetchAndStoreAshbyJobs();
        case 'wellfound':
          return await this.aggregatorService.fetchAndStoreWellfoundJobs();
        case 'builtin':
          return await this.aggregatorService.fetchAndStoreBuiltInJobs();
        case 'weworkremotely':
          return await this.aggregatorService.fetchAndStoreWeWorkRemotelyJobs();
        case 'remotive':
          return await this.aggregatorService.fetchAndStoreRemotiveJobs();
        case 'remoteyeah':
          return await this.aggregatorService.fetchAndStoreRemoteYeahJobs();
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }
    }

    // Scrape all platforms
    return await this.aggregatorService.fetchAndStoreAllJobs();
  }

  /**
   * Get scraping status
   */
  async getScrapingStatus() {
    const jobBoards = await this.jobBoardRepository.find();

    const status = await Promise.all(
      jobBoards.map(async (jb) => {
        const companies = await this.jobBoardCompanyRepository.find({
          where: { jobBoardId: jb.id },
          relations: ['company'],
        });

        const enabledCount = companies.filter(c => c.enabled).length;
        const lastScraped = companies
          .filter(c => c.lastScrapedAt)
          .sort((a, b) => {
            const timeB = b.lastScrapedAt?.getTime() ?? 0;
            const timeA = a.lastScrapedAt?.getTime() ?? 0;
            return timeB - timeA;
          })[0];

        return {
          jobBoard: jb.name,
          slug: jb.slug,
          totalCompanies: companies.length,
          enabledCompanies: enabledCount,
          disabledCompanies: companies.length - enabledCount,
          lastScraped: lastScraped?.lastScrapedAt || null,
          lastStatus: lastScraped?.scrapingStatus || null,
        };
      }),
    );

    return status;
  }

  /**
   * Get scraping history
   */
  async getScrapingHistory(limit: number) {
    const history = await this.jobBoardCompanyRepository
      .createQueryBuilder('jbc')
      .leftJoinAndSelect('jbc.jobBoard', 'jb')
      .leftJoinAndSelect('jbc.company', 'c')
      .where('jbc.lastScrapedAt IS NOT NULL')
      .orderBy('jbc.lastScrapedAt', 'DESC')
      .limit(limit)
      .getMany();

    return history;
  }

}
