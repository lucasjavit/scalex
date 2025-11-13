import { Controller, Get, Param } from '@nestjs/common';
import { CompanyService } from '../services/company.service';

@Controller('remote-jobs/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * GET /api/remote-jobs/companies/featured
   * Retorna as 20 empresas em destaque
   */
  @Get('featured')
  async getFeaturedCompanies() {
    const companies = await this.companyService.getFeaturedCompanies();

    return {
      success: true,
      data: companies,
      total: companies.length,
      cached: true, // Se veio do cache ou busca nova
    };
  }

  /**
   * GET /api/remote-jobs/companies/:slug/jobs
   * Retorna vagas de uma empresa específica
   */
  @Get(':slug/jobs')
  async getCompanyJobs(@Param('slug') slug: string) {
    const result = await this.companyService.getCompanyJobs(slug);

    return {
      success: true,
      data: result,
    };
  }
}
