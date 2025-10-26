import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
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
    const unit = this.unitsRepository.create({
      ...data,
      createdBy: userId,
    });
    return this.unitsRepository.save(unit);
  }

  async update(id: string, data: Partial<Unit>, userId: string): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, data);
    unit.updatedBy = userId;
    return this.unitsRepository.save(unit);
  }

  async remove(id: string, userId: string): Promise<void> {
    const unit = await this.findOne(id);
    unit.deletedAt = new Date();
    unit.deletedBy = userId;
    await this.unitsRepository.save(unit);
  }
}
