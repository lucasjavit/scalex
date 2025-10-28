import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { ReviewResult, ReviewSession } from '../entities/review-session.entity';
import { UserCardProgress } from '../entities/user-card-progress.entity';
import { Sm2Service } from './sm2.service';

@Injectable()
export class ReviewService {
  private readonly DAILY_NEW_CARDS_LIMIT = 20;
  private readonly CARDS_PER_SESSION = 20;

  constructor(
    @InjectRepository(UserCardProgress)
    private userCardProgressRepository: Repository<UserCardProgress>,
    @InjectRepository(ReviewSession)
    private reviewSessionRepository: Repository<ReviewSession>,
    private sm2Service: Sm2Service,
  ) {}

  /**
   * Busca cards disponíveis para revisão
   */
  async getDueCards(userId: string, limit: number = this.CARDS_PER_SESSION): Promise<UserCardProgress[]> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Busca cards que estão prontos para revisão
    // Só retorna cards que não foram revisados recentemente (últimos 5 minutos)
    const dueCards = await this.userCardProgressRepository.find({
      where: [
        {
          userId,
          nextReviewDate: LessThanOrEqual(now),
          lastReviewedAt: IsNull(),
        },
        {
          userId,
          nextReviewDate: LessThanOrEqual(now),
          lastReviewedAt: LessThanOrEqual(fiveMinutesAgo),
        },
      ],
      relations: ['card', 'card.unit'],
      order: {
        state: 'ASC', // Prioriza: new > learning > review
        nextReviewDate: 'ASC',
      },
      take: limit,
    });

    // Aplica limite de cards novos por dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newCardsAddedToday = await this.userCardProgressRepository.count({
      where: {
        userId,
        state: 'new',
        createdAt: LessThanOrEqual(today),
      },
    });

    // Se já atingiu o limite de cards novos, filtra eles
    if (newCardsAddedToday >= this.DAILY_NEW_CARDS_LIMIT) {
      return dueCards.filter((card) => card.state !== 'new');
    }

    return dueCards;
  }

  /**
   * Submete o resultado de uma revisão
   */
  async submitReview(
    userId: string,
    cardId: string,
    result: ReviewResult,
    timeTakenSeconds?: number,
  ): Promise<UserCardProgress> {
    // 1. Buscar progresso atual do card
    const cardProgress = await this.userCardProgressRepository.findOne({
      where: { userId, cardId },
    });

    if (!cardProgress) {
      throw new Error('Card progress not found');
    }

    // 2. Calcular próximo agendamento usando SM-2
    const sm2Result = this.sm2Service.calculateNextReview(cardProgress, result);

    // 3. Atualizar progresso do card
    cardProgress.easeFactor = sm2Result.easeFactor;
    cardProgress.interval = sm2Result.interval;
    cardProgress.repetitions = sm2Result.repetitions;
    cardProgress.state = sm2Result.state;
    cardProgress.nextReviewDate = sm2Result.nextReviewDate;
    cardProgress.lastReviewedAt = new Date();

    await this.userCardProgressRepository.save(cardProgress);

    // 4. Criar registro de review session (histórico)
    const reviewSession = this.reviewSessionRepository.create({
      userId,
      cardId,
      result,
      timeTakenSeconds,
      easeFactorAfter: sm2Result.easeFactor,
      intervalAfter: sm2Result.interval,
    });

    await this.reviewSessionRepository.save(reviewSession);

    return cardProgress;
  }

  /**
   * Retorna estatísticas de revisão
   */
  async getReviewStats(userId: string, period: 'today' | 'week' | 'month' = 'today'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Total de revisões no período
    const reviews = await this.reviewSessionRepository.find({
      where: {
        userId,
        reviewedAt: LessThanOrEqual(startDate),
      },
    });

    // Breakdown por resultado
    const resultsBreakdown = {
      wrong: reviews.filter((r) => r.result === 'wrong').length,
      hard: reviews.filter((r) => r.result === 'hard').length,
      good: reviews.filter((r) => r.result === 'good').length,
      easy: reviews.filter((r) => r.result === 'easy').length,
    };

    // Tempo médio por card
    const timeTakenSum = reviews.reduce((sum, r) => sum + (r.timeTakenSeconds || 0), 0);
    const averageTime = reviews.length > 0 ? Math.round(timeTakenSum / reviews.length) : 0;

    return {
      totalReviews: reviews.length,
      resultsBreakdown,
      averageTime,
    };
  }
}
