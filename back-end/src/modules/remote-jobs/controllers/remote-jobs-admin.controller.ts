import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RemoteJobsAdminService } from '../services/remote-jobs-admin.service';
import { CronConfigService } from '../services/cron-config.service';
import { JobScrapingCronService } from '../services/job-scraping-cron.service';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { RolesGuard} from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('admin/remote-jobs')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class RemoteJobsAdminController {
  private readonly logger = new Logger(RemoteJobsAdminController.name);

  constructor(
    private readonly adminService: RemoteJobsAdminService,
    private readonly cronConfigService: CronConfigService,
    private readonly cronService: JobScrapingCronService,
  ) {}

  /**
   * GET /admin/remote-jobs/dashboard
   * Dashboard overview with stats
   */
  @Get('dashboard')
  async getDashboard() {
    const stats = await this.adminService.getDashboardStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /admin/remote-jobs/companies
   * List all companies with pagination
   */
  @Get('companies')
  async getAllCompanies(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('platform') platform?: string,
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ) {
    const result = await this.adminService.getAllCompanies({
      page: page || 1,
      limit: limit || 20,
      platform,
      featured,
    });

    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /admin/remote-jobs/companies/:id
   * Get single company by ID
   */
  @Get('companies/:id')
  async getCompanyById(@Param('id') id: string) {
    const company = await this.adminService.getCompanyById(id);
    return {
      success: true,
      data: company,
    };
  }

  /**
   * POST /admin/remote-jobs/companies
   * Create new company
   */
  @Post('companies')
  async createCompany(@Body() data: any) {
    const company = await this.adminService.createCompany(data);
    return {
      success: true,
      data: company,
      message: 'Company created successfully',
    };
  }

  /**
   * PUT /admin/remote-jobs/companies/:id
   * Update company
   */
  @Put('companies/:id')
  async updateCompany(@Param('id') id: string, @Body() data: any) {
    const company = await this.adminService.updateCompany(id, data);
    return {
      success: true,
      data: company,
      message: 'Company updated successfully',
    };
  }

  /**
   * DELETE /admin/remote-jobs/companies/:id
   * Delete company
   */
  @Delete('companies/:id')
  async deleteCompany(@Param('id') id: string) {
    await this.adminService.deleteCompany(id);
    return {
      success: true,
      message: 'Company deleted successfully',
    };
  }

  /**
   * GET /admin/remote-jobs/job-boards
   * List all job boards
   */
  @Get('job-boards')
  async getAllJobBoards() {
    const jobBoards = await this.adminService.getAllJobBoards();
    return {
      success: true,
      data: jobBoards,
    };
  }

  /**
   * GET /admin/remote-jobs/job-board-companies
   * List all job board companies with filters
   */
  @Get('job-board-companies')
  async getJobBoardCompanies(
    @Query('jobBoardId') jobBoardId?: string,
    @Query('companyId') companyId?: string,
    @Query('enabled', new ParseBoolPipe({ optional: true })) enabled?: boolean,
  ) {
    const companies = await this.adminService.getJobBoardCompanies({
      jobBoardId,
      companyId,
      enabled,
    });

    return {
      success: true,
      data: companies,
    };
  }

  /**
   * POST /admin/remote-jobs/job-board-companies
   * Add company to job board
   */
  @Post('job-board-companies')
  async createJobBoardCompany(@Body() data: any) {
    const jobBoardCompany = await this.adminService.createJobBoardCompany(data);
    return {
      success: true,
      data: jobBoardCompany,
      message: 'Company added to job board successfully',
    };
  }

  /**
   * PUT /admin/remote-jobs/job-board-companies/:id
   * Update job board company configuration
   */
  @Put('job-board-companies/:id')
  async updateJobBoardCompany(@Param('id') id: string, @Body() data: any) {
    const jobBoardCompany = await this.adminService.updateJobBoardCompany(id, data);
    return {
      success: true,
      data: jobBoardCompany,
      message: 'Job board company updated successfully',
    };
  }

  /**
   * PUT /admin/remote-jobs/job-board-companies/:id/toggle
   * Enable/disable a job board company
   */
  @Put('job-board-companies/:id/toggle')
  async toggleJobBoardCompany(@Param('id') id: string) {
    const jobBoardCompany = await this.adminService.toggleJobBoardCompany(id);
    return {
      success: true,
      data: jobBoardCompany,
      message: `Company ${jobBoardCompany.enabled ? 'enabled' : 'disabled'} successfully`,
    };
  }

  /**
   * DELETE /admin/remote-jobs/job-board-companies/:id
   * Remove company from job board
   */
  @Delete('job-board-companies/:id')
  async deleteJobBoardCompany(@Param('id') id: string) {
    await this.adminService.deleteJobBoardCompany(id);
    return {
      success: true,
      message: 'Company removed from job board successfully',
    };
  }

  /**
   * POST /admin/remote-jobs/scraping/trigger
   * Trigger manual scraping
   */
  @Post('scraping/trigger')
  async triggerScraping(
    @Body('platform') platform?: string,
    @Body('companyId') companyId?: string,
  ) {
    this.logger.log(`Admin triggered scraping - platform: ${platform}, companyId: ${companyId}`);

    const result = await this.adminService.triggerScraping(platform, companyId);

    return {
      success: true,
      data: result,
      message: 'Scraping started successfully',
    };
  }

  /**
   * GET /admin/remote-jobs/scraping/status
   * Get scraping status for all job boards
   */
  @Get('scraping/status')
  async getScrapingStatus() {
    const status = await this.adminService.getScrapingStatus();
    return {
      success: true,
      data: status,
    };
  }

  /**
   * GET /admin/remote-jobs/scraping/history
   * Get scraping history
   */
  @Get('scraping/history')
  async getScrapingHistory(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const history = await this.adminService.getScrapingHistory(limit || 50);
    return {
      success: true,
      data: history,
    };
  }

  /**
   * GET /admin/remote-jobs/cron/config
   * Get current cron configuration
   */
  @Get('cron/config')
  async getCronConfig() {
    const config = await this.cronConfigService.getCronConfig();
    const description = this.cronConfigService.getCronDescription(config.value);
    const suggestions = this.cronConfigService.getSuggestedExpressions();

    return {
      success: true,
      data: {
        expression: config.value,
        description,
        suggestions,
      },
    };
  }

  /**
   * PUT /admin/remote-jobs/cron/config
   * Update cron expression
   */
  @Put('cron/config')
  async updateCronConfig(@Body('expression') expression: string) {
    this.logger.log(`Admin updating cron expression to: ${expression}`);

    const config = await this.cronConfigService.updateCronExpression(
      expression,
      this.cronService.handleCron.bind(this.cronService),
    );

    const description = this.cronConfigService.getCronDescription(config.value);

    return {
      success: true,
      data: {
        expression: config.value,
        description,
      },
      message: `Cron updated successfully: ${description}`,
    };
  }

}
