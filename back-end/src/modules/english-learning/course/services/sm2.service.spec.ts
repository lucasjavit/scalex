import { Test, TestingModule } from '@nestjs/testing';
import { Sm2Service } from './sm2.service';
import { UserCardProgress } from '../entities/user-card-progress.entity';

describe('Sm2Service', () => {
  let service: Sm2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sm2Service],
    }).compile();

    service = module.get<Sm2Service>(Sm2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInitialProgress', () => {
    it('should create initial progress with correct default values', () => {
      const userId = 'user-123';
      const cardId = 'card-456';

      const progress = service.createInitialProgress(userId, cardId);

      expect(progress.userId).toBe(userId);
      expect(progress.cardId).toBe(cardId);
      expect(progress.easeFactor).toBe(2.5);
      expect(progress.interval).toBe(0);
      expect(progress.repetitions).toBe(0);
      expect(progress.state).toBe('new');
      expect(progress.nextReviewDate).toBeInstanceOf(Date);
      expect(progress.lastReviewedAt).toBeUndefined();
    });
  });

  describe('calculateNextReview - NEW card', () => {
    let newCard: UserCardProgress;

    beforeEach(() => {
      newCard = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        state: 'new',
        nextReviewDate: new Date(),
        lastReviewedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };
    });

    it('should handle WRONG result on new card', () => {
      const result = service.calculateNextReview(newCard, 'wrong');

      expect(result.state).toBe('learning');
      expect(result.interval).toBe(1); // 1 minute
      expect(result.repetitions).toBe(0);
      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it('should handle HARD result on new card', () => {
      const result = service.calculateNextReview(newCard, 'hard');

      expect(result.state).toBe('learning');
      expect(result.interval).toBe(1); // 1 minute
      expect(result.repetitions).toBe(0);
      expect(result.easeFactor).toBe(2.35); // 2.5 - 0.15
    });

    it('should handle GOOD result on new card', () => {
      const result = service.calculateNextReview(newCard, 'good');

      expect(result.state).toBe('learning');
      expect(result.interval).toBe(1); // 1 minute
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBe(2.5); // unchanged
    });

    it('should handle EASY result on new card', () => {
      const result = service.calculateNextReview(newCard, 'easy');

      expect(result.state).toBe('review'); // Skip learning phase
      expect(result.interval).toBe(7200); // 5 days
      expect(result.repetitions).toBe(3);
      expect(result.easeFactor).toBe(2.5); // max limit
    });
  });

  describe('calculateNextReview - LEARNING card', () => {
    let learningCard: UserCardProgress;

    beforeEach(() => {
      learningCard = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 2.5,
        interval: 10,
        repetitions: 1,
        state: 'learning',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };
    });

    it('should handle WRONG result on learning card', () => {
      const result = service.calculateNextReview(learningCard, 'wrong');

      expect(result.state).toBe('learning');
      expect(result.interval).toBe(1); // Reset to 1 minute
      expect(result.repetitions).toBe(0); // Reset
      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it('should handle GOOD result and progress through learning stages', () => {
      // First repetition (rep=0)
      const card1 = { ...learningCard, repetitions: 0, interval: 1 };
      const result1 = service.calculateNextReview(card1, 'good');
      expect(result1.interval).toBe(10); // 10 minutes
      expect(result1.repetitions).toBe(1);
      expect(result1.state).toBe('learning');

      // Second repetition (rep=1)
      const card2 = { ...learningCard, repetitions: 1, interval: 10 };
      const result2 = service.calculateNextReview(card2, 'good');
      expect(result2.interval).toBe(1440); // 1 day
      expect(result2.repetitions).toBe(2);
      expect(result2.state).toBe('learning');

      // Third repetition (rep=2) - graduates to REVIEW
      const card3 = { ...learningCard, repetitions: 2, interval: 1440 };
      const result3 = service.calculateNextReview(card3, 'good');
      expect(result3.interval).toBe(7200); // 5 days
      expect(result3.repetitions).toBe(3);
      expect(result3.state).toBe('review'); // Graduated!
    });

    it('should handle EASY result on learning card', () => {
      const result = service.calculateNextReview(learningCard, 'easy');

      expect(result.state).toBe('review'); // Skip to review
      expect(result.interval).toBe(7200); // 5 days
      expect(result.repetitions).toBe(3);
      expect(result.easeFactor).toBe(2.5); // max limit (2.5 + 0.1 capped)
    });
  });

  describe('calculateNextReview - REVIEW card', () => {
    let reviewCard: UserCardProgress;

    beforeEach(() => {
      reviewCard = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 2.5,
        interval: 7200, // 5 days
        repetitions: 3,
        state: 'review',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };
    });

    it('should handle WRONG result on review card - reset to learning', () => {
      const result = service.calculateNextReview(reviewCard, 'wrong');

      expect(result.state).toBe('learning'); // Back to learning
      expect(result.interval).toBe(1); // Reset to 1 minute
      expect(result.repetitions).toBe(0); // Reset
      expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    });

    it('should handle HARD result on review card', () => {
      const result = service.calculateNextReview(reviewCard, 'hard');

      expect(result.state).toBe('review');
      expect(result.interval).toBe(Math.round(7200 * 1.2)); // 8640 minutes
      expect(result.repetitions).toBe(4);
      expect(result.easeFactor).toBe(2.35); // 2.5 - 0.15
    });

    it('should handle GOOD result on review card - exponential growth', () => {
      const result = service.calculateNextReview(reviewCard, 'good');

      expect(result.state).toBe('review');
      expect(result.interval).toBe(Math.round(7200 * 2.5)); // 18000 minutes (12.5 days)
      expect(result.repetitions).toBe(4);
      expect(result.easeFactor).toBe(2.5); // unchanged
    });

    it('should handle EASY result on review card - max growth', () => {
      const result = service.calculateNextReview(reviewCard, 'easy');

      expect(result.state).toBe('review');
      expect(result.interval).toBe(Math.round(7200 * 2.5 * 1.3)); // 23400 minutes
      expect(result.repetitions).toBe(4);
      expect(result.easeFactor).toBe(2.5); // max limit (2.5 + 0.1 capped)
    });

    it('should grow intervals exponentially over multiple reviews', () => {
      let card = { ...reviewCard };

      // First review: GOOD
      let result = service.calculateNextReview(card, 'good');
      expect(result.interval).toBe(18000); // ~12.5 days

      // Second review: GOOD
      card = { ...reviewCard, interval: result.interval, repetitions: result.repetitions };
      result = service.calculateNextReview(card, 'good');
      expect(result.interval).toBe(45000); // ~31 days

      // Third review: GOOD
      card = { ...reviewCard, interval: result.interval, repetitions: result.repetitions };
      result = service.calculateNextReview(card, 'good');
      expect(result.interval).toBe(112500); // ~78 days

      // After many reviews, can reach years
      card = { ...reviewCard, interval: 525600, repetitions: 20 }; // 1 year
      result = service.calculateNextReview(card, 'good');
      expect(result.interval).toBe(1314000); // ~2.5 years
    });
  });

  describe('calculateNextReview - ease_factor boundaries', () => {
    it('should not let ease_factor go below 1.3', () => {
      const card: UserCardProgress = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 1.3, // Already at minimum
        interval: 1440,
        repetitions: 5,
        state: 'review',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };

      const result = service.calculateNextReview(card, 'wrong');
      expect(result.easeFactor).toBe(1.3); // Should not go below 1.3
    });

    it('should not let ease_factor go above 2.5', () => {
      const card: UserCardProgress = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 2.5, // Already at maximum
        interval: 1440,
        repetitions: 5,
        state: 'review',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };

      const result = service.calculateNextReview(card, 'easy');
      expect(result.easeFactor).toBe(2.5); // Should not go above 2.5
    });
  });

  describe('formatInterval', () => {
    it('should format minutes correctly', () => {
      expect(service.formatInterval(1)).toBe('1min');
      expect(service.formatInterval(30)).toBe('30min');
    });

    it('should format hours correctly', () => {
      expect(service.formatInterval(60)).toBe('1h');
      expect(service.formatInterval(120)).toBe('2h');
    });

    it('should format days correctly', () => {
      expect(service.formatInterval(1440)).toBe('1d'); // 1 day
      expect(service.formatInterval(7200)).toBe('5d'); // 5 days
    });

    it('should format months correctly', () => {
      expect(service.formatInterval(43200)).toBe('1m'); // ~30 days
      expect(service.formatInterval(86400)).toBe('2m'); // ~60 days
    });

    it('should format years correctly', () => {
      expect(service.formatInterval(525600)).toBe('1y'); // 1 year
      expect(service.formatInterval(1051200)).toBe('2y'); // 2 years
    });
  });

  describe('nextReviewDate calculation', () => {
    it('should set correct nextReviewDate based on interval', () => {
      const card: UserCardProgress = {
        id: 'progress-1',
        userId: 'user-1',
        cardId: 'card-1',
        easeFactor: 2.5,
        interval: 1440, // 1 day
        repetitions: 2,
        state: 'learning',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        card: null,
      };

      const now = Date.now();
      const result = service.calculateNextReview(card, 'good');

      const expectedDate = new Date(now + 7200 * 60 * 1000); // 5 days in ms
      const actualDate = result.nextReviewDate;

      // Allow 1 second tolerance for test execution time
      const timeDiff = Math.abs(actualDate.getTime() - expectedDate.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });
});
