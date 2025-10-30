import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { ReviewSession } from '../entities/review-session.entity';
import { UserCardProgress } from '../entities/user-card-progress.entity';
import { UserStageProgress } from '../entities/user-stage-progress.entity';
import { UserUnitProgress } from '../entities/user-unit-progress.entity';
import { CardsService } from './cards.service';
import { Sm2Service } from './sm2.service';
import { UnitsService } from './units.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserStageProgress)
    private userStageProgressRepository: Repository<UserStageProgress>,
    @InjectRepository(UserUnitProgress)
    private userUnitProgressRepository: Repository<UserUnitProgress>,
    @InjectRepository(UserCardProgress)
    private userCardProgressRepository: Repository<UserCardProgress>,
    @InjectRepository(ReviewSession)
    private reviewSessionRepository: Repository<ReviewSession>,
    private unitsService: UnitsService,
    private cardsService: CardsService,
    private sm2Service: Sm2Service,
  ) {}

  // ========================================
  // STAGE PROGRESS
  // ========================================

  async startStage(
    userId: string,
    stageId: string,
  ): Promise<UserStageProgress> {
    const existing = await this.userStageProgressRepository.findOne({
      where: { userId, stageId },
    });

    if (existing) {
      return existing;
    }

    const progress = this.userStageProgressRepository.create({
      userId,
      stageId,
    });

    return this.userStageProgressRepository.save(progress);
  }

  async getStageProgress(
    userId: string,
    stageId: string,
  ): Promise<UserStageProgress | null> {
    return this.userStageProgressRepository.findOne({
      where: { userId, stageId },
      relations: ['stage'],
    });
  }

  async completeStage(
    userId: string,
    stageId: string,
  ): Promise<UserStageProgress> {
    let progress = await this.getStageProgress(userId, stageId);

    if (!progress) {
      progress = await this.startStage(userId, stageId);
    }

    progress.isCompleted = true;
    progress.completedAt = new Date();

    return this.userStageProgressRepository.save(progress);
  }

  // ========================================
  // UNIT PROGRESS
  // ========================================

  async startUnit(userId: string, unitId: string): Promise<UserUnitProgress> {
    try {
      console.log('🔍 Looking for existing progress for:', { userId, unitId });

      const existing = await this.userUnitProgressRepository.findOne({
        where: { userId, unitId },
      });

      if (existing) {
        console.log('✅ Found existing progress, returning it');
        return existing;
      }

      console.log('📝 Creating new progress...');
      const progress = this.userUnitProgressRepository.create({
        userId,
        unitId,
      });

      console.log('💾 Saving progress...');
      const saved = await this.userUnitProgressRepository.save(progress);
      console.log('✅ Progress saved successfully');

      return saved;
    } catch (error) {
      console.error('❌ Error in startUnit:', error);
      throw error;
    }
  }

  async updateWatchTime(
    userId: string,
    unitId: string,
    watchTimeSeconds: number,
  ): Promise<UserUnitProgress> {
    let progress = await this.userUnitProgressRepository.findOne({
      where: { userId, unitId },
    });

    if (!progress) {
      progress = await this.startUnit(userId, unitId);
    }

    progress.watchTimeSeconds = watchTimeSeconds;
    return this.userUnitProgressRepository.save(progress);
  }

  async completeUnit(
    userId: string,
    unitId: string,
  ): Promise<{ cardsCreated: number }> {
    // 1. Buscar unit e verificar se existe
    const unit = await this.unitsService.findOne(unitId);

    // 2. Buscar ou criar progresso
    const progress = await this.userUnitProgressRepository.findOne({
      where: { userId, unitId },
    });

    // 3. Marcar unit como completa
    if (progress) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await this.userUnitProgressRepository.save(progress);
    } else {
      await this.userUnitProgressRepository.save({
        userId,
        unitId,
        isCompleted: true,
        completedAt: new Date(),
        watchTimeSeconds: unit.videoDuration,
      });
    }

    // 4. Buscar cards da unit
    const cards = await this.cardsService.findByUnit(unitId);

    // 5. Criar progresso para cada card (se ainda não existe)
    let cardsCreated = 0;

    for (const card of cards) {
      const existingCardProgress =
        await this.userCardProgressRepository.findOne({
          where: { userId, cardId: card.id },
        });

      if (!existingCardProgress) {
        const initialProgress = this.sm2Service.createInitialProgress(
          userId,
          card.id,
        );
        await this.userCardProgressRepository.save(initialProgress);
        cardsCreated++;
      }
    }

    // 6. Verificar se todas as units do stage foram completadas
    const allUnits = await this.unitsService.findByStage(unit.stageId);
    const completedUnits = await this.userUnitProgressRepository.count({
      where: {
        userId,
        unitId: In(allUnits.map((u) => u.id)),
        isCompleted: true,
      },
    });

    if (completedUnits === allUnits.length) {
      await this.completeStage(userId, unit.stageId);
    }

    return { cardsCreated };
  }

  async skipUnit(userId: string, unitId: string): Promise<void> {
    let progress = await this.userUnitProgressRepository.findOne({
      where: { userId, unitId },
    });

    if (!progress) {
      progress = await this.startUnit(userId, unitId);
    }

    // Apenas marca como "iniciado", mas não cria cards
    await this.userUnitProgressRepository.save(progress);
  }

  async getUnitProgress(
    userId: string,
    unitId: string,
  ): Promise<UserUnitProgress | null> {
    return this.userUnitProgressRepository.findOne({
      where: { userId, unitId },
      relations: ['unit'],
    });
  }

  // ========================================
  // DASHBOARD & STATISTICS
  // ========================================

  async getDashboardStats(userId: string): Promise<any> {
    // Cards due (disponíveis para revisão)
    const now = new Date();
    const newCards = await this.userCardProgressRepository.count({
      where: {
        userId,
        state: 'new',
        nextReviewDate: MoreThanOrEqual(now),
      },
    });

    const learningCards = await this.userCardProgressRepository.count({
      where: {
        userId,
        state: 'learning',
        nextReviewDate: MoreThanOrEqual(now),
      },
    });

    const reviewCards = await this.userCardProgressRepository.count({
      where: {
        userId,
        state: 'review',
        nextReviewDate: MoreThanOrEqual(now),
      },
    });

    return {
      cardsDue: {
        new: newCards,
        learning: learningCards,
        review: reviewCards,
        total: newCards + learningCards + reviewCards,
      },
    };
  }

  // ========================================
  // ADMIN MANAGEMENT METHODS
  // ========================================

  async resetUserProgress(userId: string): Promise<void> {
    console.log('🔄 Resetting progress for user:', userId);

    // Delete user stage progress
    const stagesResult = await this.userStageProgressRepository.delete({
      userId,
    });
    console.log('📊 Deleted stage progress:', stagesResult.affected || 0);

    // Delete user unit progress
    const unitsResult = await this.userUnitProgressRepository.delete({
      userId,
    });
    console.log('📊 Deleted unit progress:', unitsResult.affected || 0);

    // Delete user card progress
    const cardsResult = await this.userCardProgressRepository.delete({
      userId,
    });
    console.log('📊 Deleted card progress:', cardsResult.affected || 0);

    // Delete review sessions for this user
    const reviewsResult = await this.reviewSessionRepository.delete({ userId });
    console.log('📊 Deleted review sessions:', reviewsResult.affected || 0);

    console.log('✅ Reset completed successfully');
  }

  async deleteUnitProgress(userId: string, unitId: string): Promise<void> {
    await this.userUnitProgressRepository.delete({ userId, unitId });
  }

  async deleteStageProgress(userId: string, stageId: string): Promise<void> {
    await this.userStageProgressRepository.delete({ userId, stageId });
  }

  async forceCompleteUnit(
    userId: string,
    unitId: string,
  ): Promise<UserUnitProgress> {
    let progress = await this.userUnitProgressRepository.findOne({
      where: { userId, unitId },
    });

    if (!progress) {
      progress = this.userUnitProgressRepository.create({
        userId,
        unitId,
        isCompleted: true,
        watchTimeSeconds: 100,
      });
    } else {
      progress.isCompleted = true;
    }

    return this.userUnitProgressRepository.save(progress);
  }

  async forceCompleteStage(
    userId: string,
    stageId: string,
  ): Promise<UserStageProgress> {
    let progress = await this.userStageProgressRepository.findOne({
      where: { userId, stageId },
    });

    if (!progress) {
      progress = this.userStageProgressRepository.create({
        userId,
        stageId,
      });
    }

    progress.isCompleted = true;
    return this.userStageProgressRepository.save(progress);
  }
}
