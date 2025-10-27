import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
      order: { orderIndex: 'ASC' },
      relations: ['unit'],
    });
  }

  async findByUnit(unitId: string): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { unitId, deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
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
    const orderIndex = data.orderIndex || 1;
    const unitId = data.unitId;
    
    // Reorganizar cards existentes do mesmo unit: incrementar os que estão >= orderIndex
    if (unitId) {
      const existingCards = await this.cardsRepository.find({
        where: { unitId, deletedAt: IsNull() },
        order: { orderIndex: 'ASC' },
      });

      const cardsToUpdate = existingCards.filter(c => c.orderIndex >= orderIndex);
      
      if (cardsToUpdate.length > 0) {
        cardsToUpdate.forEach(c => {
          c.orderIndex += 1;
        });
        await this.cardsRepository.save(cardsToUpdate);
      }
    }

    const card = this.cardsRepository.create({
      ...data,
      createdBy: userId,
    });
    return this.cardsRepository.save(card);
  }

  async update(id: string, data: Partial<Card>, userId: string): Promise<Card> {
    const card = await this.findOne(id);

    // Se está mudando o orderIndex, reorganizar outros cards do mesmo unit
    if (data.orderIndex !== undefined && data.orderIndex !== card.orderIndex) {
      await this.reorderCards(id, card.unitId, card.orderIndex, data.orderIndex);
    }

    Object.assign(card, data);
    card.updatedBy = userId;
    return this.cardsRepository.save(card);
  }

  /**
   * Reorganiza os orderIndex de todos os cards de um unit quando um card muda de posição
   * @param cardId - ID do card sendo movido
   * @param unitId - ID do unit (para reorganizar apenas cards do mesmo unit)
   * @param oldIndex - Índice antigo
   * @param newIndex - Novo índice
   */
  private async reorderCards(cardId: string, unitId: string, oldIndex: number, newIndex: number): Promise<void> {
    // Buscar todos os cards do mesmo unit, não deletados, exceto o que está sendo movido
    const cards = await this.cardsRepository.find({
      where: { unitId, deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
    });

    // Filtrar o card que está sendo movido
    const otherCards = cards.filter(c => c.id !== cardId);

    // Reorganizar os índices
    if (newIndex > oldIndex) {
      // Movendo para frente: decrementar os cards entre oldIndex e newIndex
      for (const c of otherCards) {
        if (c.orderIndex > oldIndex && c.orderIndex <= newIndex) {
          c.orderIndex -= 1;
          await this.cardsRepository.save(c);
        }
      }
    } else {
      // Movendo para trás: incrementar os cards entre newIndex e oldIndex
      for (const c of otherCards) {
        if (c.orderIndex >= newIndex && c.orderIndex < oldIndex) {
          c.orderIndex += 1;
          await this.cardsRepository.save(c);
        }
      }
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const card = await this.findOne(id);
    card.deletedAt = new Date();
    card.deletedBy = userId;
    await this.cardsRepository.save(card);
  }
}
