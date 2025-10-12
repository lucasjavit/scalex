import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../entities/language.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  async findAll(): Promise<Language[]> {
    return await this.languageRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Language> {
    const language = await this.languageRepository.findOne({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return language;
  }

  async findByCode(code: string): Promise<Language> {
    const language = await this.languageRepository.findOne({
      where: { code },
    });
    if (!language) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }
    return language;
  }
}
