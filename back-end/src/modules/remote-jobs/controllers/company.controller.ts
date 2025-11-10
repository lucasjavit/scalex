import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';

@Controller('remote-jobs/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * GET /api/remote-jobs/companies/featured
   * Retorna as 20 empresas em destaque
   * Cache: 30 minutos no Redis
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
   * Cache: 30 minutos no Redis
   */
  @Get(':slug/jobs')
  async getCompanyJobs(@Param('slug') slug: string) {
    const result = await this.companyService.getCompanyJobs(slug);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * DELETE /api/remote-jobs/companies/:slug/cache
   * Limpa o cache de uma empresa (útil para debug/admin)
   */
  @Delete(':slug/cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCache(@Param('slug') slug: string) {
    await this.companyService.clearCompanyCache(slug);
  }

  /**
   * DELETE /api/remote-jobs/companies/featured/cache
   * Limpa o cache de empresas featured
   */
  @Delete('featured/cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearFeaturedCache() {
    await this.companyService.clearFeaturedCache();
  }
}
