import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {}

  async findAll(): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['unit'],
    });
  }

  async findByUnit(unitId: string): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { unitId, deletedAt: IsNull() },
    });
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['unit'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async create(data: Partial<Card>, userId: string): Promise<Card> {
    const card = this.cardsRepository.create({
      ...data,
      createdBy: userId,
    });
    return this.cardsRepository.save(card);
  }

  async update(id: string, data: Partial<Card>, userId: string): Promise<Card> {
    const card = await this.findOne(id);
    Object.assign(card, data);
    card.updatedBy = userId;
    return this.cardsRepository.save(card);
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id);
    card.deletedAt = new Date();
    card.deletedBy = userId;
    await this.cardsRepository.save(card);
  }
}
