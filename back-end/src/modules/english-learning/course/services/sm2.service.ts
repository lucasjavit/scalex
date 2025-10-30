import { Injectable } from '@nestjs/common';
import {
  UserCardProgress,
  CardState,
} from '../entities/user-card-progress.entity';
import { ReviewResult } from '../entities/review-session.entity';

interface Sm2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  state: CardState;
  nextReviewDate: Date;
}

@Injectable()
export class Sm2Service {
  // Configurações fixas do algoritmo SM-2
  private readonly MIN_EASE_FACTOR = 1.3;
  private readonly MAX_EASE_FACTOR = 2.5;
  private readonly INITIAL_EASE_FACTOR = 2.5;

  // Intervalos em MINUTOS
  private readonly WRONG_INTERVAL = 1; // 1 minuto
  private readonly HARD_INTERVAL = 10; // 10 minutos
  private readonly GOOD_INTERVAL_FIRST = 1440; // 1 dia
  private readonly EASY_INTERVAL_FIRST = 7200; // 5 dias

  // Ajustes do ease_factor
  private readonly EASE_BONUS_EASY = 0.1;
  private readonly EASE_PENALTY_HARD = 0.15;
  private readonly EASE_PENALTY_WRONG = 0.2;

  // Threshold para mudar de learning para review
  private readonly LEARNING_THRESHOLD = 3;

  /**
   * Calcula o próximo agendamento de revisão baseado no resultado
   */
  calculateNextReview(
    cardProgress: UserCardProgress,
    result: ReviewResult,
  ): Sm2Result {
    let easeFactor = cardProgress.easeFactor;
    let interval = cardProgress.interval;
    let repetitions = cardProgress.repetitions;
    let state = cardProgress.state;

    // ========================================
    // RESULTADO: WRONG (De novo) 🔴
    // ========================================
    if (result === 'wrong') {
      easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        easeFactor - this.EASE_PENALTY_WRONG,
      );
      interval = this.WRONG_INTERVAL;
      repetitions = 0;
      state = 'learning';
    }

    // ========================================
    // RESULTADO: HARD (Difícil) 🟡
    // ========================================
    else if (result === 'hard') {
      easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        easeFactor - this.EASE_PENALTY_HARD,
      );

      if (state === 'new') {
        interval = this.WRONG_INTERVAL;
        repetitions = 0;
        state = 'learning';
      } else if (state === 'learning') {
        interval = this.HARD_INTERVAL;
        repetitions = Math.min(repetitions + 1, this.LEARNING_THRESHOLD - 1);
      } else {
        // review
        interval = Math.round(interval * 1.2);
        repetitions++;
      }
    }

    // ========================================
    // RESULTADO: GOOD (Bom) 🟢
    // ========================================
    else if (result === 'good') {
      if (state === 'new') {
        interval = this.WRONG_INTERVAL;
        repetitions = 1;
        state = 'learning';
      } else if (state === 'learning') {
        if (repetitions === 0) {
          interval = this.HARD_INTERVAL;
          repetitions = 1;
        } else if (repetitions === 1) {
          interval = this.GOOD_INTERVAL_FIRST;
          repetitions = 2;
        } else {
          interval = this.EASY_INTERVAL_FIRST;
          repetitions = this.LEARNING_THRESHOLD;
          state = 'review';
        }
      } else {
        // review
        interval = Math.round(interval * easeFactor);
        repetitions++;
      }
    }

    // ========================================
    // RESULTADO: EASY (Fácil) 🔵
    // ========================================
    else if (result === 'easy') {
      easeFactor = Math.min(
        this.MAX_EASE_FACTOR,
        easeFactor + this.EASE_BONUS_EASY,
      );

      if (state === 'new' || state === 'learning') {
        interval = this.EASY_INTERVAL_FIRST;
        repetitions = this.LEARNING_THRESHOLD;
        state = 'review';
      } else {
        // review
        interval = Math.round(interval * easeFactor * 1.3);
        repetitions++;
      }
    }

    // Calcula próxima data de revisão
    const nextReviewDate = new Date(Date.now() + interval * 60 * 1000);

    return {
      easeFactor,
      interval,
      repetitions,
      state,
      nextReviewDate,
    };
  }

  /**
   * Cria um novo progresso de card para um usuário
   */
  createInitialProgress(
    userId: string,
    cardId: string,
  ): Partial<UserCardProgress> {
    return {
      userId,
      cardId,
      easeFactor: this.INITIAL_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      state: 'new',
      nextReviewDate: new Date(), // Disponível imediatamente
      lastReviewedAt: undefined,
    };
  }

  /**
   * Formata intervalo em minutos para string legível
   */
  formatInterval(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    } else if (minutes < 1440) {
      const hours = Math.round(minutes / 60);
      return `${hours}h`;
    } else if (minutes < 43200) {
      const days = Math.round(minutes / 1440);
      return `${days}d`;
    } else if (minutes < 525600) {
      const months = Math.round(minutes / 43200);
      return `${months}m`;
    } else {
      const years = Math.round(minutes / 525600);
      return `${years}y`;
    }
  }
}
