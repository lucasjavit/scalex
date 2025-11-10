import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
  externalId: string;
  platform: string;
  companySlug: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  remote: boolean;
  countries: string[];
  tags: string[];
  seniority: string;
  employmentType: string;
  requirements: string[];
  benefits: string[];
  externalUrl: string;
  publishedAt: Date;
}

/**
 * Classe base abstrata para todos os scrapers
 * Implementa lógica comum e força implementação de métodos específicos
 */
export abstract class BaseScraperService {
  protected abstract readonly logger: Logger;
  protected abstract readonly baseUrl: string;
  protected abstract readonly platformName: string;

  constructor(protected readonly httpService: HttpService) {}

  /**
   * Método abstrato que cada scraper deve implementar
   * Busca vagas do job board específico
   */
  abstract fetchJobs(): Promise<ScrapedJob[]>;

  /**
   * Método comum: Faz requisição HTTP com retry e headers padrão
   */
  protected async fetchHtml(url: string, timeout = 15000): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `❌ Erro ao buscar ${url}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Método comum: Parse HTML com Cheerio
   */
  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  /**
   * Método comum: Extrai e parse JSON-LD do HTML
   */
  protected extractJsonLD(
    $: cheerio.CheerioAPI,
    type?: string,
  ): any[] {
    const jsonLdData: any[] = [];

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '');

        // Se type for especificado, filtra apenas esse tipo
        if (!type || jsonData['@type'] === type) {
          jsonLdData.push(jsonData);
        }
      } catch (error) {
        // Ignora scripts que não são JSON válido
      }
    });

    return jsonLdData;
  }

  /**
   * Método comum: Gera ID único baseado na URL
   */
  protected generateId(url: string): string {
    // Remove protocolo e www para normalizar
    const normalized = url.replace(/^https?:\/\/(www\.)?/, '');
    return Buffer.from(normalized).toString('base64').substring(0, 50);
  }

  /**
   * Método comum: Extrai slug da empresa do nome
   */
  protected extractCompanySlug(companyName: string): string {
    return companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Método comum: Infere nível de senioridade do título
   */
  protected inferSeniority(title: string): string {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes('senior') ||
      lowerTitle.includes('sr.') ||
      lowerTitle.includes('sr ')
    ) {
      return 'senior';
    }

    if (
      lowerTitle.includes('junior') ||
      lowerTitle.includes('jr.') ||
      lowerTitle.includes('jr ')
    ) {
      return 'junior';
    }

    if (
      lowerTitle.includes('lead') ||
      lowerTitle.includes('principal') ||
      lowerTitle.includes('staff') ||
      lowerTitle.includes('architect')
    ) {
      return 'senior';
    }

    if (
      lowerTitle.includes('intern') ||
      lowerTitle.includes('trainee') ||
      lowerTitle.includes('entry')
    ) {
      return 'entry';
    }

    return 'mid';
  }

  /**
   * Método comum: Mapeia tipo de emprego
   */
  protected mapEmploymentType(type: string | null | undefined): string {
    if (!type) return 'full-time';

    const lowerType = type.toLowerCase();

    if (lowerType.includes('full') || lowerType.includes('time')) {
      return 'full-time';
    }
    if (lowerType.includes('part')) return 'part-time';
    if (lowerType.includes('contract') || lowerType.includes('freelance')) {
      return 'contract';
    }
    if (lowerType.includes('intern')) return 'internship';

    return 'full-time';
  }

  /**
   * Método comum: Parse salary de diferentes formatos
   */
  protected parseSalary(salaryData: any): string | undefined {
    if (!salaryData) return undefined;

    // Se for objeto JSON-LD (baseSalary)
    if (typeof salaryData === 'object') {
      const currency = salaryData.currency || 'USD';
      const value = salaryData.value?.value || salaryData.value;

      if (value) {
        return `${currency} ${value}`;
      }

      if (salaryData.minValue && salaryData.maxValue) {
        return `${currency} ${salaryData.minValue} - ${salaryData.maxValue}`;
      }
    }

    // Se for string
    if (typeof salaryData === 'string') {
      return salaryData.trim();
    }

    return undefined;
  }

  /**
   * Método comum: Extrai lista de países
   */
  protected extractCountries(requirements: any): string[] {
    if (!requirements) return [];

    if (Array.isArray(requirements)) {
      return requirements
        .map((r) => (typeof r === 'string' ? r : r.name))
        .filter(Boolean);
    }

    if (typeof requirements === 'string') {
      return [requirements];
    }

    return [];
  }

  /**
   * Método comum: Extrai tags/skills
   */
  protected extractTags(skills: any): string[] {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      return skills
        .map((s) => (typeof s === 'string' ? s : s.name || s.skillName))
        .filter(Boolean);
    }

    if (typeof skills === 'string') {
      return skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    return [];
  }

  /**
   * Método comum: Normaliza URL
   */
  protected normalizeUrl(url: string): string {
    if (!url) return '';

    // Se já for URL completa
    if (url.startsWith('http')) {
      return url;
    }

    // Se começar com /
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }

    // Caso contrário, adiciona /
    return `${this.baseUrl}/${url}`;
  }

  /**
   * Método comum: Limpa texto HTML
   */
  protected cleanText(text: string | null | undefined): string {
    if (!text) return '';

    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Método comum: Valida se job tem dados mínimos necessários
   */
  protected isValidJob(job: Partial<ScrapedJob>): boolean {
    return !!(job.title && job.companySlug && job.externalUrl);
  }

  /**
   * Método comum: Log de progresso
   */
  protected logProgress(current: number, total: number, message: string): void {
    if (current % 10 === 0 || current === total) {
      this.logger.log(`📊 ${message} (${current}/${total})`);
    }
  }
}
