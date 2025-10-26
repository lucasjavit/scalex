import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Stage } from '../entities/stage.entity';
import { Unit } from '../entities/unit.entity';
import { UserUnitProgress } from '../entities/user-unit-progress.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private stagesRepository: Repository<Stage>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(UserUnitProgress)
    private userUnitProgressRepository: Repository<UserUnitProgress>,
  ) {}

  async findAll(): Promise<Stage[]> {
    return this.stagesRepository.find({
      where: { deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
      relations: ['units'],
    });
  }

  async findAllWithProgress(userId: string): Promise<any[]> {
    // Get all stages, ordered
    const stages = await this.stagesRepository.find({
      where: { deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
      relations: ['units'],
    });

    // Get all units for all stages
    const allUnits = await this.unitsRepository.find({
      where: { deletedAt: IsNull() },
      order: { orderIndex: 'ASC' },
    });

    // Get user progress for all units
    const allUnitIds = allUnits.map(u => u.id);
    const progressRecords = await this.userUnitProgressRepository.find({
      where: { userId, unitId: In(allUnitIds) },
    });

    // Create a map for quick lookup
    const progressMap = new Map(
      progressRecords.map(p => [p.unitId, p])
    );

    // Helper function to check if a stage is completed
    const isStageCompleted = (stage: Stage): boolean => {
      const stageUnits = allUnits.filter(u => u.stageId === stage.id);
      if (stageUnits.length === 0) return false;

      // All units must be completed
      return stageUnits.every(unit => {
        const progress = progressMap.get(unit.id);
        return progress?.isCompleted || false;
      });
    };

    // Calculate stats for each stage
    const stagesWithProgress = stages.map((stage, index) => {
      const stageUnits = allUnits.filter(u => u.stageId === stage.id);
      const completedUnits = stageUnits.filter(unit => {
        const progress = progressMap.get(unit.id);
        return progress?.isCompleted || false;
      });

      const isCompleted = isStageCompleted(stage);

      // First stage is always unlocked
      let isUnlocked = index === 0;

      // Other stages are unlocked if previous stage is completed
      if (index > 0) {
        const previousStage = stages[index - 1];
        isUnlocked = isStageCompleted(previousStage);
      }

      return {
        ...stage,
        isUnlocked,
        isCompleted,
        totalUnits: stageUnits.length,
        completedUnits: completedUnits.length,
        progress: stageUnits.length > 0
          ? Math.round((completedUnits.length / stageUnits.length) * 100)
          : 0,
      };
    });

    return stagesWithProgress;
  }

  async findOne(id: string): Promise<Stage> {
    const stage = await this.stagesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['units'],
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async create(data: Partial<Stage>, userId: string): Promise<Stage> {
    const stage = this.stagesRepository.create({
      ...data,
      createdBy: userId,
    });
    return this.stagesRepository.save(stage);
  }

  async update(id: string, data: Partial<Stage>, userId: string): Promise<Stage> {
    const stage = await this.findOne(id);
    Object.assign(stage, data);
    stage.updatedBy = userId;
    return this.stagesRepository.save(stage);
  }

  async remove(id: string, userId: string): Promise<void> {
    const stage = await this.findOne(id);
    stage.deletedAt = new Date();
    stage.deletedBy = userId;
    await this.stagesRepository.save(stage);
  }
}
