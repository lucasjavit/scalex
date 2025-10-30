import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UserStageProgress } from '../entities/user-stage-progress.entity';
import { UserUnitProgress } from '../entities/user-unit-progress.entity';
import { UserCardProgress } from '../entities/user-card-progress.entity';
import { UnitsService } from './units.service';
import { CardsService } from './cards.service';
import { Sm2Service } from './sm2.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let userStageProgressRepository: Repository<UserStageProgress>;
  let userUnitProgressRepository: Repository<UserUnitProgress>;
  let userCardProgressRepository: Repository<UserCardProgress>;
  let unitsService: UnitsService;
  let cardsService: CardsService;
  let sm2Service: Sm2Service;

  const mockUserStageProgressRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUserUnitProgressRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUserCardProgressRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUnitsService = {
    findOne: jest.fn(),
    findByStage: jest.fn(),
  };

  const mockCardsService = {
    findByUnit: jest.fn(),
  };

  const mockSm2Service = {
    createInitialProgress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(UserStageProgress),
          useValue: mockUserStageProgressRepository,
        },
        {
          provide: getRepositoryToken(UserUnitProgress),
          useValue: mockUserUnitProgressRepository,
        },
        {
          provide: getRepositoryToken(UserCardProgress),
          useValue: mockUserCardProgressRepository,
        },
        {
          provide: UnitsService,
          useValue: mockUnitsService,
        },
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
        {
          provide: Sm2Service,
          useValue: mockSm2Service,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    userStageProgressRepository = module.get(
      getRepositoryToken(UserStageProgress),
    );
    userUnitProgressRepository = module.get(
      getRepositoryToken(UserUnitProgress),
    );
    userCardProgressRepository = module.get(
      getRepositoryToken(UserCardProgress),
    );
    unitsService = module.get<UnitsService>(UnitsService);
    cardsService = module.get<CardsService>(CardsService);
    sm2Service = module.get<Sm2Service>(Sm2Service);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startStage', () => {
    it('should create new stage progress if not exists', async () => {
      const userId = 'user-123';
      const stageId = 'stage-456';

      mockUserStageProgressRepository.findOne.mockResolvedValue(null);
      mockUserStageProgressRepository.create.mockReturnValue({
        userId,
        stageId,
      });
      mockUserStageProgressRepository.save.mockResolvedValue({
        id: 'progress-1',
        userId,
        stageId,
        isCompleted: false,
        startedAt: new Date(),
      });

      const result = await service.startStage(userId, stageId);

      expect(mockUserStageProgressRepository.findOne).toHaveBeenCalledWith({
        where: { userId, stageId },
      });
      expect(mockUserStageProgressRepository.create).toHaveBeenCalledWith({
        userId,
        stageId,
      });
      expect(result.userId).toBe(userId);
      expect(result.stageId).toBe(stageId);
    });

    it('should return existing stage progress if already exists', async () => {
      const userId = 'user-123';
      const stageId = 'stage-456';
      const existingProgress = {
        id: 'progress-1',
        userId,
        stageId,
        isCompleted: false,
        startedAt: new Date(),
      };

      mockUserStageProgressRepository.findOne.mockResolvedValue(
        existingProgress,
      );

      const result = await service.startStage(userId, stageId);

      expect(mockUserStageProgressRepository.findOne).toHaveBeenCalledWith({
        where: { userId, stageId },
      });
      expect(mockUserStageProgressRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingProgress);
    });
  });

  describe('updateWatchTime', () => {
    it('should update watch time for existing progress', async () => {
      const userId = 'user-123';
      const unitId = 'unit-456';
      const watchTimeSeconds = 120;

      const existingProgress = {
        id: 'progress-1',
        userId,
        unitId,
        watchTimeSeconds: 60,
      };

      mockUserUnitProgressRepository.findOne.mockResolvedValue(
        existingProgress,
      );
      mockUserUnitProgressRepository.save.mockResolvedValue({
        ...existingProgress,
        watchTimeSeconds,
      });

      const result = await service.updateWatchTime(
        userId,
        unitId,
        watchTimeSeconds,
      );

      expect(result.watchTimeSeconds).toBe(watchTimeSeconds);
      expect(mockUserUnitProgressRepository.save).toHaveBeenCalled();
    });

    it('should create new progress if not exists', async () => {
      const userId = 'user-123';
      const unitId = 'unit-456';
      const watchTimeSeconds = 120;

      mockUserUnitProgressRepository.findOne.mockResolvedValue(null);
      mockUserUnitProgressRepository.create.mockReturnValue({
        userId,
        unitId,
      });
      mockUserUnitProgressRepository.save.mockResolvedValue({
        id: 'progress-1',
        userId,
        unitId,
        watchTimeSeconds,
      });

      const result = await service.updateWatchTime(
        userId,
        unitId,
        watchTimeSeconds,
      );

      expect(result.watchTimeSeconds).toBe(watchTimeSeconds);
    });
  });

  describe('completeUnit', () => {
    const userId = 'user-123';
    const unitId = 'unit-456';
    const stageId = 'stage-789';

    const mockUnit = {
      id: unitId,
      stageId,
      title: 'Test Unit',
      videoDuration: 300, // 5 minutes
      youtubeUrl: 'https://youtube.com/test',
      orderIndex: 1,
    };

    const mockCards = [
      { id: 'card-1', unitId, question: 'Q1', answer: 'A1' },
      { id: 'card-2', unitId, question: 'Q2', answer: 'A2' },
      { id: 'card-3', unitId, question: 'Q3', answer: 'A3' },
    ];

    it('should throw error if user watched less than 80% of video', async () => {
      const progress = {
        userId,
        unitId,
        watchTimeSeconds: 200, // Only 66.6% of 300 seconds
        isCompleted: false,
      };

      mockUnitsService.findOne.mockResolvedValue(mockUnit);
      mockUserUnitProgressRepository.findOne.mockResolvedValue(progress);

      await expect(service.completeUnit(userId, unitId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should complete unit and create cards when 80% watched', async () => {
      const progress = {
        userId,
        unitId,
        watchTimeSeconds: 240, // 80% of 300 seconds
        isCompleted: false,
      };

      mockUnitsService.findOne.mockResolvedValue(mockUnit);
      mockUserUnitProgressRepository.findOne.mockResolvedValue(progress);
      mockUserUnitProgressRepository.save.mockResolvedValue({
        ...progress,
        isCompleted: true,
        completedAt: new Date(),
      });
      mockCardsService.findByUnit.mockResolvedValue(mockCards);
      mockUserCardProgressRepository.findOne.mockResolvedValue(null); // No existing progress
      mockSm2Service.createInitialProgress.mockImplementation((uid, cid) => ({
        userId: uid,
        cardId: cid,
        state: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
      }));
      mockUserCardProgressRepository.save.mockImplementation((progress) =>
        Promise.resolve(progress),
      );
      mockUnitsService.findByStage.mockResolvedValue([mockUnit]); // Mock findByStage
      mockUserUnitProgressRepository.count.mockResolvedValue(0); // Not all units completed yet

      const result = await service.completeUnit(userId, unitId);

      expect(result.cardsCreated).toBe(3);
      expect(mockUserUnitProgressRepository.save).toHaveBeenCalled();
      expect(mockCardsService.findByUnit).toHaveBeenCalledWith(unitId);
      expect(mockSm2Service.createInitialProgress).toHaveBeenCalledTimes(3);
      expect(mockUserCardProgressRepository.save).toHaveBeenCalledTimes(3);
    });

    it('should not create duplicate cards if already exist', async () => {
      const progress = {
        userId,
        unitId,
        watchTimeSeconds: 240,
        isCompleted: false,
      };

      mockUnitsService.findOne.mockResolvedValue(mockUnit);
      mockUserUnitProgressRepository.findOne.mockResolvedValue(progress);
      mockUserUnitProgressRepository.save.mockResolvedValue({
        ...progress,
        isCompleted: true,
      });
      mockCardsService.findByUnit.mockResolvedValue(mockCards);

      // First card exists, others don't
      mockUserCardProgressRepository.findOne
        .mockResolvedValueOnce({ id: 'existing-1' }) // card-1 exists
        .mockResolvedValueOnce(null) // card-2 doesn't exist
        .mockResolvedValueOnce(null); // card-3 doesn't exist

      mockSm2Service.createInitialProgress.mockImplementation((uid, cid) => ({
        userId: uid,
        cardId: cid,
        state: 'new',
      }));
      mockUserCardProgressRepository.save.mockImplementation((progress) =>
        Promise.resolve(progress),
      );
      mockUnitsService.findByStage.mockResolvedValue([mockUnit]); // Mock findByStage
      mockUserUnitProgressRepository.count.mockResolvedValue(0); // Not all units completed yet

      const result = await service.completeUnit(userId, unitId);

      expect(result.cardsCreated).toBe(2); // Only 2 new cards
      expect(mockUserCardProgressRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should complete stage if all units are completed', async () => {
      const progress = {
        userId,
        unitId,
        watchTimeSeconds: 240,
        isCompleted: false,
      };

      const allUnits = [
        { id: 'unit-1', stageId },
        { id: 'unit-2', stageId },
        { id: unitId, stageId }, // current unit
      ];

      mockUnitsService.findOne.mockResolvedValue(mockUnit);
      mockUserUnitProgressRepository.findOne.mockResolvedValue(progress);
      mockUserUnitProgressRepository.save.mockResolvedValue({
        ...progress,
        isCompleted: true,
      });
      mockCardsService.findByUnit.mockResolvedValue([]);
      mockUnitsService.findByStage.mockResolvedValue(allUnits);
      mockUserUnitProgressRepository.count.mockResolvedValue(3); // All 3 units completed

      const mockStageProgress = {
        userId,
        stageId,
        isCompleted: false,
      };
      mockUserStageProgressRepository.findOne.mockResolvedValue(
        mockStageProgress,
      );
      mockUserStageProgressRepository.save.mockResolvedValue({
        ...mockStageProgress,
        isCompleted: true,
        completedAt: new Date(),
      });

      await service.completeUnit(userId, unitId);

      expect(mockUserStageProgressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isCompleted: true,
          completedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return correct dashboard statistics', async () => {
      const userId = 'user-123';
      const now = new Date();

      mockUserCardProgressRepository.count
        .mockResolvedValueOnce(5) // new cards
        .mockResolvedValueOnce(10) // learning cards
        .mockResolvedValueOnce(20); // review cards

      const result = await service.getDashboardStats(userId);

      expect(result.cardsDue).toEqual({
        new: 5,
        learning: 10,
        review: 20,
        total: 35,
      });
    });
  });
});
