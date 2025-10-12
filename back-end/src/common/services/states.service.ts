import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../entities/state.entity';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  async findAll(): Promise<State[]> {
    return await this.stateRepository.find({
      relations: ['country'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<State> {
    const state = await this.stateRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }
    return state;
  }

  async findByCountry(countryId: string): Promise<State[]> {
    return await this.stateRepository.find({
      where: { country: { id: countryId } },
      relations: ['country'],
      order: { name: 'ASC' },
    });
  }
}
