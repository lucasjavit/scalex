import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ReviewService } from './review.service';
import { UserCardProgress } from '../entities/user-card-progress.entity';
import { ReviewSession } from '../entities/review-session.entity';
import { Sm2Service } from './sm2.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let userCardProgressRepository: Repository<UserCardProgress>;
  let reviewSessionRepository: Repository<ReviewSession>;
  let sm2Service: Sm2Service;

  const mockUserCardProgressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockReviewSessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockSm2Service = {
    calculateNextReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(UserCardProgress),
          useValue: mockUserCardProgressRepository,
        },
        {
          provide: getRepositoryToken(ReviewSession),
          useValue: mockReviewSessionRepository,
        },
        {
          provide: Sm2Service,
          useValue: mockSm2Service,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    userCardProgressRepository = module.get(
      getRepositoryToken(UserCardProgress),
    );
    reviewSessionRepository = module.get(getRepositoryToken(ReviewSession));
    sm2Service = module.get<Sm2Service>(Sm2Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDueCards', () => {
    it('should return cards due for review', async () => {
      const userId = 'user-123';
      const now = new Date();

      const mockCards = [
        {
          id: 'progress-1',
          userId,
          cardId: 'card-1',
          state: 'new',
          nextReviewDate: new Date(now.getTime() - 1000), // Due 1 second ago
          card: { id: 'card-1', question: 'Q1', answer: 'A1' },
        },
        {
          id: 'progress-2',
          userId,
          cardId: 'card-2',
          state: 'learning',
          nextReviewDate: new Date(now.getTime() - 60000), // Due 1 minute ago
          card: { id: 'card-2', question: 'Q2', answer: 'A2' },
        },
      ];

      mockUserCardProgressRepository.find.mockResolvedValue(mockCards);

      const result = await service.getDueCards(userId, 20);

      expect(result).toHaveLength(2);
      expect(mockUserCardProgressRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
          nextReviewDate: expect.any(Object), // LessThanOrEqual(now)
        },
        relations: ['card', 'card.unit'],
        order: {
          state: 'ASC',
          nextReviewDate: 'ASC',
        },
        take: 20,
      });
    });

    it('should respect limit parameter', async () => {
      const userId = 'user-123';

      mockUserCardProgressRepository.find.mockResolvedValue([]);

      await service.getDueCards(userId, 10);

      expect(mockUserCardProgressRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should filter out new cards if daily limit reached', async () => {
      const userId = 'user-123';
      const now = new Date();

      const mockCards = [
        {
          id: 'progress-1',
          userId,
          cardId: 'card-1',
          state: 'new',
          nextReviewDate: now,
          card: { id: 'card-1' },
        },
        {
          id: 'progress-2',
          userId,
          cardId: 'card-2',
          state: 'learning',
          nextReviewDate: now,
          card: { id: 'card-2' },
        },
        {
          id: 'progress-3',
          userId,
          cardId: 'card-3',
          state: 'review',
          nextReviewDate: now,
          card: { id: 'card-3' },
        },
      ];

      mockUserCardProgressRepository.find.mockResolvedValue(mockCards);
      mockUserCardProgressRepository.count.mockResolvedValue(20); // Already 20 new cards today

      const result = await service.getDueCards(userId, 20);

      // Should only return learning and review cards, not new
      expect(result).toHaveLength(2);
      expect(result.every((card) => card.state !== 'new')).toBe(true);
    });
  });

  describe('submitReview', () => {
    const userId = 'user-123';
    const cardId = 'card-456';

    it('should update card progress and create review session', async () => {
      const currentProgress = {
        id: 'progress-1',
        userId,
        cardId,
        easeFactor: 2.5,
        interval: 1440, // 1 day
        repetitions: 2,
        state: 'learning',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
      };

      const sm2Result = {
        easeFactor: 2.5,
        interval: 7200, // 5 days
        repetitions: 3,
        state: 'review',
        nextReviewDate: new Date(Date.now() + 7200 * 60 * 1000),
      };

      mockUserCardProgressRepository.findOne.mockResolvedValue(currentProgress);
      mockSm2Service.calculateNextReview.mockReturnValue(sm2Result);
      mockUserCardProgressRepository.save.mockResolvedValue({
        ...currentProgress,
        ...sm2Result,
      });
      mockReviewSessionRepository.create.mockReturnValue({
        userId,
        cardId,
        result: 'good',
        timeTakenSeconds: 10,
        easeFactorAfter: sm2Result.easeFactor,
        intervalAfter: sm2Result.interval,
      });
      mockReviewSessionRepository.save.mockResolvedValue({
        id: 'session-1',
        userId,
        cardId,
        result: 'good',
      });

      const result = await service.submitReview(userId, cardId, 'good', 10);

      expect(mockSm2Service.calculateNextReview).toHaveBeenCalledWith(
        currentProgress,
        'good',
      );
      expect(mockUserCardProgressRepository.save).toHaveBeenCalled();
      expect(mockReviewSessionRepository.create).toHaveBeenCalled();
      expect(mockReviewSessionRepository.save).toHaveBeenCalled();
      expect(result.state).toBe('review');
      expect(result.interval).toBe(7200);
    });

    it('should throw error if card progress not found', async () => {
      mockUserCardProgressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitReview(userId, cardId, 'good'),
      ).rejects.toThrow('Card progress not found');
    });

    it('should handle all review results (wrong, hard, good, easy)', async () => {
      const currentProgress = {
        id: 'progress-1',
        userId,
        cardId,
        easeFactor: 2.5,
        interval: 7200,
        repetitions: 5,
        state: 'review',
        nextReviewDate: new Date(),
        lastReviewedAt: new Date(),
      };

      mockUserCardProgressRepository.findOne.mockResolvedValue(currentProgress);

      const results: Array<'wrong' | 'hard' | 'good' | 'easy'> = [
        'wrong',
        'hard',
        'good',
        'easy',
      ];

      for (const result of results) {
        mockSm2Service.calculateNextReview.mockReturnValue({
          easeFactor: 2.0,
          interval: 1440,
          repetitions: 0,
          state: 'learning',
          nextReviewDate: new Date(),
        });

        mockUserCardProgressRepository.save.mockResolvedValue(currentProgress);
        mockReviewSessionRepository.create.mockReturnValue({});
        mockReviewSessionRepository.save.mockResolvedValue({});

        await service.submitReview(userId, cardId, result, 5);

        expect(mockSm2Service.calculateNextReview).toHaveBeenCalledWith(
          currentProgress,
          result,
        );
      }
    });
  });

  describe('getReviewStats', () => {
    const userId = 'user-123';

    it('should return review statistics for today', async () => {
      const mockReviews = [
        { id: '1', result: 'good', timeTakenSeconds: 5 },
        { id: '2', result: 'good', timeTakenSeconds: 7 },
        { id: '3', result: 'wrong', timeTakenSeconds: 10 },
        { id: '4', result: 'easy', timeTakenSeconds: 3 },
        { id: '5', result: 'hard', timeTakenSeconds: 8 },
      ];

      mockReviewSessionRepository.find.mockResolvedValue(mockReviews);

      const result = await service.getReviewStats(userId, 'today');

      expect(result.totalReviews).toBe(5);
      expect(result.resultsBreakdown).toEqual({
        wrong: 1,
        hard: 1,
        good: 2,
        easy: 1,
      });
      expect(result.averageTime).toBe(Math.round((5 + 7 + 10 + 3 + 8) / 5));
    });

    it('should return zero averageTime if no reviews', async () => {
      mockReviewSessionRepository.find.mockResolvedValue([]);

      const result = await service.getReviewStats(userId, 'today');

      expect(result.totalReviews).toBe(0);
      expect(result.averageTime).toBe(0);
    });

    it('should handle different time periods', async () => {
      mockReviewSessionRepository.find.mockResolvedValue([]);

      await service.getReviewStats(userId, 'today');
      await service.getReviewStats(userId, 'week');
      await service.getReviewStats(userId, 'month');

      expect(mockReviewSessionRepository.find).toHaveBeenCalledTimes(3);
    });

    it('should calculate correct breakdown percentages', async () => {
      const mockReviews = [
        { id: '1', result: 'good', timeTakenSeconds: 5 },
        { id: '2', result: 'good', timeTakenSeconds: 5 },
        { id: '3', result: 'good', timeTakenSeconds: 5 },
        { id: '4', result: 'good', timeTakenSeconds: 5 },
        { id: '5', result: 'wrong', timeTakenSeconds: 5 },
      ];

      mockReviewSessionRepository.find.mockResolvedValue(mockReviews);

      const result = await service.getReviewStats(userId, 'today');

      expect(result.resultsBreakdown).toEqual({
        wrong: 1, // 20%
        hard: 0, // 0%
        good: 4, // 80%
        easy: 0, // 0%
      });
    });
  });
});
