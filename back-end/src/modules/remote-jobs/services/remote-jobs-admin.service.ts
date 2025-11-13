import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { JobBoard } from '../entities/job-board.entity';
import { JobBoardCompany } from '../entities/job-board-company.entity';
import { JobBoardAggregatorService } from './job-board-aggregator.service';
import { seedWorkableCompanies } from '../seeds/seed-workable-companies';
import { seedLeverCompanies } from '../seeds/seed-lever-companies';
import { seedGreenhouseCompanies } from '../seeds/seed-greenhouse-companies';
import { seedAshbyCompanies } from '../seeds/seed-ashby-companies';
import { seedBuiltInCompanies } from '../seeds/seed-builtin-companies';
import { seedAggregators } from '../seeds/seed-aggregators';

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
    private readonly dataSource: DataSource,
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

  /**
   * Run all seeds to populate companies and job boards
   * This will populate the database with companies from all platforms
   */
  async runAllSeeds() {
    this.logger.log('🌍 Iniciando execução de todos os seeds...');

    const results = {
      workable: { success: false, error: null },
      lever: { success: false, error: null },
      greenhouse: { success: false, error: null },
      ashby: { success: false, error: null },
      builtin: { success: false, error: null },
      aggregators: { success: false, error: null },
    };

    try {
      // 1. Workable
      this.logger.log('📍 [1/6] Executando seed Workable...');
      try {
        await seedWorkableCompanies(this.dataSource);
        results.workable.success = true;
        this.logger.log('✅ Workable concluído');
      } catch (error) {
        results.workable.error = error.message;
        this.logger.error(`❌ Erro no seed Workable: ${error.message}`);
      }

      // 2. Lever
      this.logger.log('📍 [2/6] Executando seed Lever...');
      try {
        await seedLeverCompanies(this.dataSource);
        results.lever.success = true;
        this.logger.log('✅ Lever concluído');
      } catch (error) {
        results.lever.error = error.message;
        this.logger.error(`❌ Erro no seed Lever: ${error.message}`);
      }

      // 3. Greenhouse
      this.logger.log('📍 [3/6] Executando seed Greenhouse...');
      try {
        await seedGreenhouseCompanies(this.dataSource);
        results.greenhouse.success = true;
        this.logger.log('✅ Greenhouse concluído');
      } catch (error) {
        results.greenhouse.error = error.message;
        this.logger.error(`❌ Erro no seed Greenhouse: ${error.message}`);
      }

      // 4. Ashby
      this.logger.log('📍 [4/6] Executando seed Ashby...');
      try {
        await seedAshbyCompanies(this.dataSource);
        results.ashby.success = true;
        this.logger.log('✅ Ashby concluído');
      } catch (error) {
        results.ashby.error = error.message;
        this.logger.error(`❌ Erro no seed Ashby: ${error.message}`);
      }

      // 5. Built In
      this.logger.log('📍 [5/6] Executando seed Built In...');
      try {
        await seedBuiltInCompanies(this.dataSource);
        results.builtin.success = true;
        this.logger.log('✅ Built In concluído');
      } catch (error) {
        results.builtin.error = error.message;
        this.logger.error(`❌ Erro no seed Built In: ${error.message}`);
      }

      // 6. Agregadores
      this.logger.log('📍 [6/6] Executando seed Agregadores...');
      try {
        await seedAggregators(this.dataSource);
        results.aggregators.success = true;
        this.logger.log('✅ Agregadores concluído');
      } catch (error) {
        results.aggregators.error = error.message;
        this.logger.error(`❌ Erro no seed Agregadores: ${error.message}`);
      }

      const successCount = Object.values(results).filter(r => r.success).length;
      this.logger.log(`🎉 Seeds concluídos: ${successCount}/6 com sucesso`);

      return {
        success: successCount > 0,
        results,
        summary: {
          total: 6,
          successful: successCount,
          failed: 6 - successCount,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Erro geral ao executar seeds: ${error.message}`);
      throw error;
    }
  }

}
