import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly genericScraper: GenericScraperService,
    private readonly jobService: JobService,
  ) {}

  /**
   * Retorna as 20 empresas featured (com cache Redis)
   * Busca em tempo real quando necessário
   */
  async getFeaturedCompanies(): Promise<any[]> {
    const cacheKey = 'companies:featured';

    // 1. Tenta pegar do cache Redis (30 min)
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      this.logger.log('✅ Empresas featured retornadas do cache');
      return cached;
    }

    this.logger.log('🔍 Cache miss - buscando empresas featured em tempo real...');

    // 2. Busca em tempo real (só Lever por agora - MVP)
    const leverCompanies = FEATURED_COMPANIES.filter(
      (c) => c.platform === 'lever',
    );

    const companiesWithJobs = await Promise.all(
      leverCompanies.map(async (company) => {
        // Configura GenericScraper para Lever
        this.genericScraper.configure({
          slug: 'lever',
          name: 'Lever',
          url: `https://jobs.lever.co/${company.slug}`,
        });

        const jobs = await this.genericScraper.fetchJobs();
        const jobCount = jobs.length;

        return {
          slug: company.slug,
          name: company.name,
          platform: company.platform,
          logo: this.getCompanyLogo(company.slug),
          totalJobs: jobCount,
          featured: true,
        };
      }),
    );

    // 3. Ordena por quantidade de vagas (desc)
    const sorted = companiesWithJobs.sort((a, b) => b.totalJobs - a.totalJobs);

    // 4. Salva no cache Redis por 30 minutos
    await this.cacheManager.set(cacheKey, sorted, 1800);
    this.logger.log(`✅ ${sorted.length} empresas featured salvas no cache`);

    return sorted;
  }

  /**
   * Retorna vagas de uma empresa específica (com cache Redis)
   */
  async getCompanyJobs(companySlug: string): Promise<any> {
    const cacheKey = `jobs:company:${companySlug}`;

    // 1. Tenta pegar do cache (30 min)
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.log(`✅ Vagas da ${companySlug} retornadas do cache`);
      return cached;
    }

    this.logger.log(`🔍 Cache miss - buscando vagas da ${companySlug}...`);

    // 2. Busca a empresa para saber qual plataforma
    const company = FEATURED_COMPANIES.find((c) => c.slug === companySlug);
    if (!company) {
      throw new Error(`Empresa ${companySlug} não encontrada`);
    }

    // 3. Busca vagas em tempo real usando GenericScraper
    this.genericScraper.configure({
      slug: company.platform,
      name: company.name,
      url: `https://jobs.lever.co/${companySlug}`,
    });

    const jobs = await this.genericScraper.fetchJobs();

    // 4. Create/update company record no PostgreSQL
    await this.companyRepository.save({
      slug: company.slug,
      name: company.name,
      platform: company.platform,
      websiteUrl: `https://${company.slug}.com`,
      logoUrl: this.getCompanyLogo(company.slug),
      description: `${company.name} - Featured Company`,
      featured: true,
    });

    // 5. Prepara resultado com vagas
    const result = {
      company: {
        slug: company.slug,
        name: company.name,
        platform: company.platform,
        logo: this.getCompanyLogo(company.slug),
      },
      jobs,
      total: jobs.length,
    };

    // 6. Salva APENAS no Redis (não salva vagas no PostgreSQL)
    await this.cacheManager.set(cacheKey, result, 1800);
    this.logger.log(`✅ ${jobs.length} vagas da ${companySlug} salvas no Redis`);

    return result;
  }

  /**
   * Retorna logo da empresa (placeholder)
   */
  private getCompanyLogo(slug: string): string {
    // TODO: buscar logos reais ou usar serviço como Clearbit
    return `https://logo.clearbit.com/${slug}.com`;
  }

  /**
   * Limpa cache de uma empresa específica
   */
  async clearCompanyCache(companySlug: string): Promise<void> {
    await this.cacheManager.del(`jobs:company:${companySlug}`);
    this.logger.log(`🗑️  Cache da ${companySlug} limpo`);
  }

  /**
   * Limpa cache de empresas featured
   */
  async clearFeaturedCache(): Promise<void> {
    await this.cacheManager.del('companies:featured');
    this.logger.log('🗑️  Cache de empresas featured limpo');
  }
}
