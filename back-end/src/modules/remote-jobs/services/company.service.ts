import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GenericScraperService } from '../scrapers/generic-scraper.service';
import { JobService } from './job.service';
import { FEATURED_COMPANIES } from '../constants/featured-companies';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly genericScraper: GenericScraperService,
    private readonly jobService: JobService,
  ) {}

  /**
   * Retorna as 20 empresas featured do PostgreSQL
   */
  async getFeaturedCompanies(): Promise<any[]> {
    this.logger.log('🔍 Buscando empresas featured do PostgreSQL...');

    // Busca empresas featured do banco de dados
    const companies = await this.companyRepository.find({
      where: { featured: true },
      order: { totalJobs: 'DESC' },
    });

    if (companies.length === 0) {
      this.logger.warn('⚠️  Nenhuma empresa featured encontrada no banco');
      return [];
    }

    const result = companies.map((company) => ({
      slug: company.slug,
      name: company.name,
      platform: company.platform,
      logo: company.logo || this.getCompanyLogo(company.slug),
      totalJobs: company.totalJobs,
      featured: company.featured,
    }));

    this.logger.log(`✅ ${result.length} empresas featured retornadas`);
    return result;
  }

  /**
   * Retorna vagas de uma empresa específica do PostgreSQL
   */
  async getCompanyJobs(companySlug: string): Promise<any> {
    this.logger.log(`🔍 Buscando vagas da ${companySlug} no PostgreSQL...`);

    // Busca a empresa no banco de dados
    const company = await this.companyRepository.findOne({
      where: { slug: companySlug },
    });

    if (!company) {
      throw new Error(`Empresa ${companySlug} não encontrada`);
    }

    // Busca vagas da empresa usando JobService
    const jobs = await this.jobService.getJobsByCompany(companySlug);

    // Prepara resultado
    const result = {
      company: {
        slug: company.slug,
        name: company.name,
        platform: company.platform,
        logo: company.logo || this.getCompanyLogo(company.slug),
      },
      jobs,
      total: jobs.length,
    };

    this.logger.log(`✅ ${jobs.length} vagas da ${companySlug} retornadas`);
    return result;
  }

  /**
   * Retorna logo da empresa (placeholder)
   */
  private getCompanyLogo(slug: string): string {
    // TODO: buscar logos reais ou usar serviço como Clearbit
    return `https://logo.clearbit.com/${slug}.com`;
  }
}
