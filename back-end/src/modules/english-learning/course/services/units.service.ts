import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Unit } from '../entities/unit.entity';
import { UserUnitProgress } from '../entities/user-unit-progress.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UserUnitProgress)
    private userUnitProgressRepository: Repository<UserUnitProgress>,
  ) {}

  async findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({
      where: { deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
      relations: ['stage', 'cards'],
    });
  }

  async findByStage(stageId: string): Promise<Unit[]> {
    return this.unitsRepository.find({
      where: { stageId, deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
      relations: ['cards'],
    });
  }

  async findByStageWithProgress(stageId: string, userId: string): Promise<any[]> {
    // Get all units for this stage, ordered
    const units = await this.unitsRepository.find({
      where: { stageId, deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
      relations: ['cards'],
    });

    // Get user progress for all units in this stage
    const unitIds = units.map(u => u.id);
    const progressRecords = await this.userUnitProgressRepository.find({
      where: { userId, unitId: In(unitIds) },
    });

    // Create a map for quick lookup
    const progressMap = new Map(
      progressRecords.map(p => [p.unitId, p])
    );

    // Determine which units are unlocked
    const unitsWithProgress = units.map((unit, index) => {
      const progress = progressMap.get(unit.id);

      // First unit is always unlocked
      let isUnlocked = index === 0;

      // Other units are unlocked if previous unit is completed
      if (index > 0) {
        const previousUnit = units[index - 1];
        const previousProgress = progressMap.get(previousUnit.id);
        isUnlocked = previousProgress?.isCompleted || false;
      }

      return {
        ...unit,
        isUnlocked,
        isCompleted: progress?.isCompleted || false,
        watchTimeSeconds: progress?.watchTimeSeconds || 0,
      };
    });

    return unitsWithProgress;
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['stage', 'cards'],
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async create(data: Partial<Unit>, userId: string): Promise<Unit> {
    const orderIndex = data.orderIndex || 1;
    const stageId = data.stageId;
    
    // Reorganizar units existentes do mesmo stage: incrementar os que estão >= orderIndex
    if (stageId) {
      const existingUnits = await this.unitsRepository.find({
        where: { stageId, deletedAt: IsNull() },
        order: { orderIndex: 'ASC' },
      });

      const unitsToUpdate = existingUnits.filter(u => u.orderIndex >= orderIndex);
      
      if (unitsToUpdate.length > 0) {
        unitsToUpdate.forEach(u => {
          u.orderIndex += 1;
        });
        await this.unitsRepository.save(unitsToUpdate);
      }
    }

    const unit = this.unitsRepository.create({
      ...data,
      createdBy: userId,
    });
    return this.unitsRepository.save(unit);
  }

  async update(id: string, data: Partial<Unit>, userId: string): Promise<Unit> {
    const unit = await this.findOne(id);

    // Se está mudando o orderIndex, reorganizar outros units do mesmo stage
    if (data.orderIndex !== undefined && data.orderIndex !== unit.orderIndex) {
      await this.reorderUnits(id, unit.stageId, unit.orderIndex, data.orderIndex);
    }

    Object.assign(unit, data);
    unit.updatedBy = userId;
    return this.unitsRepository.save(unit);
  }

  /**
   * Reorganiza os orderIndex de todos os units de um stage quando um unit muda de posição
   * @param unitId - ID do unit sendo movido
   * @param stageId - ID do stage (para reorganizar apenas units do mesmo stage)
   * @param oldIndex - Índice antigo
   * @param newIndex - Novo índice
   */
  private async reorderUnits(unitId: string, stageId: string, oldIndex: number, newIndex: number): Promise<void> {
    // Buscar todos os units do mesmo stage, não deletados, exceto o que está sendo movido
    const units = await this.unitsRepository.find({
      where: { stageId, deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
    });

    // Filtrar o unit que está sendo movido
    const otherUnits = units.filter(u => u.id !== unitId);

    // Reorganizar os índices
    if (newIndex > oldIndex) {
      // Movendo para frente: decrementar os units entre oldIndex e newIndex
      for (const u of otherUnits) {
        if (u.orderIndex > oldIndex && u.orderIndex <= newIndex) {
          u.orderIndex -= 1;
          await this.unitsRepository.save(u);
        }
      }
    } else {
      // Movendo para trás: incrementar os units entre newIndex e oldIndex
      for (const u of otherUnits) {
        if (u.orderIndex >= newIndex && u.orderIndex < oldIndex) {
          u.orderIndex += 1;
          await this.unitsRepository.save(u);
        }
      }
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const unit = await this.findOne(id);
    unit.deletedAt = new Date();
    unit.deletedBy = userId;
    await this.unitsRepository.save(unit);
  }
}
