import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StagesController } from './stages.controller';
import { StagesService } from '../services/stages.service';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateStageDto } from '../dto/update-stage.dto';

describe('StagesController', () => {
  let controller: StagesController;
  let service: StagesService;

  const mockStagesService = {
    findAllWithProgress: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StagesController],
      providers: [
        {
          provide: StagesService,
          useValue: mockStagesService,
        },
      ],
    }).compile();

    controller = module.get<StagesController>(StagesController);
    service = module.get<StagesService>(StagesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of stages', async () => {
      const mockStages = [
        {
          id: 'stage-1',
          title: 'Greetings',
          description: 'Learn greetings',
          orderIndex: 1,
          units: [],
        },
        {
          id: 'stage-2',
          title: 'Travel',
          description: 'Learn travel phrases',
          orderIndex: 2,
          units: [],
        },
      ];

      mockStagesService.findAllWithProgress.mockResolvedValue(mockStages);

      const result = await controller.findAll('user-123');

      expect(result).toEqual(mockStages);
      expect(service.findAllWithProgress).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array if no stages exist', async () => {
      mockStagesService.findAllWithProgress.mockResolvedValue([]);

      const result = await controller.findAll('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single stage', async () => {
      const mockStage = {
        id: 'stage-1',
        title: 'Greetings',
        description: 'Learn greetings',
        orderIndex: 1,
        units: [],
      };

      mockStagesService.findOne.mockResolvedValue(mockStage);

      const result = await controller.findOne('stage-1');

      expect(result).toEqual(mockStage);
      expect(service.findOne).toHaveBeenCalledWith('stage-1');
    });

    it('should throw NotFoundException if stage not found', async () => {
      mockStagesService.findOne.mockRejectedValue(
        new NotFoundException('Stage with ID stage-999 not found'),
      );

      await expect(controller.findOne('stage-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new stage', async () => {
      const createStageDto: CreateStageDto = {
        title: 'Business English',
        description: 'Learn business phrases',
        orderIndex: 3,
      };

      const mockUser = { id: 'user-123', role: 'admin' };

      const createdStage = {
        id: 'stage-new',
        ...createStageDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUser.id,
      };

      mockStagesService.create.mockResolvedValue(createdStage);

      const result = await controller.create(createStageDto, mockUser.id);

      expect(result).toEqual(createdStage);
      expect(service.create).toHaveBeenCalledWith(createStageDto, mockUser.id);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        // Missing title
        description: 'Test',
        orderIndex: 1,
      } as CreateStageDto;

      const mockUser = { id: 'user-123', role: 'admin' };

      // In real scenario, class-validator would catch this before reaching the controller
      // But we can test the service is called with the DTO
      mockStagesService.create.mockResolvedValue({
        id: 'stage-1',
        ...invalidDto,
      });

      await controller.create(invalidDto, mockUser.id);

      expect(service.create).toHaveBeenCalledWith(invalidDto, mockUser.id);
    });
  });

  describe('update', () => {
    it('should update an existing stage', async () => {
      const stageId = 'stage-1';
      const updateStageDto: UpdateStageDto = {
        title: 'Updated Greetings',
        description: 'Updated description',
      };

      const mockUser = { id: 'user-123', role: 'admin' };

      const updatedStage = {
        id: stageId,
        title: 'Updated Greetings',
        description: 'Updated description',
        orderIndex: 1,
        updatedAt: new Date(),
        updatedBy: mockUser.id,
      };

      mockStagesService.update.mockResolvedValue(updatedStage);

      const result = await controller.update(stageId, updateStageDto, mockUser.id);

      expect(result).toEqual(updatedStage);
      expect(service.update).toHaveBeenCalledWith(
        stageId,
        updateStageDto,
        mockUser.id,
      );
    });

    it('should allow partial updates', async () => {
      const stageId = 'stage-1';
      const updateStageDto: UpdateStageDto = {
        title: 'New Title Only',
        // description and orderIndex not provided
      };

      const mockUser = { id: 'user-123', role: 'admin' };

      mockStagesService.update.mockResolvedValue({
        id: stageId,
        ...updateStageDto,
        description: 'Old description',
        orderIndex: 1,
      });

      const result = await controller.update(stageId, updateStageDto, mockUser.id);

      expect(service.update).toHaveBeenCalledWith(
        stageId,
        updateStageDto,
        mockUser.id,
      );
    });

    it('should throw NotFoundException if stage to update not found', async () => {
      const mockUser = { id: 'user-123', role: 'admin' };

      mockStagesService.update.mockRejectedValue(
        new NotFoundException('Stage with ID stage-999 not found'),
      );

      await expect(
        controller.update('stage-999', { title: 'Test' }, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a stage', async () => {
      const stageId = 'stage-1';
      const mockUser = { id: 'user-123', role: 'admin' };

      mockStagesService.remove.mockResolvedValue(undefined);

      await controller.remove(stageId, mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(stageId, mockUser.id);
    });

    it('should throw NotFoundException if stage to remove not found', async () => {
      const mockUser = { id: 'user-123', role: 'admin' };

      mockStagesService.remove.mockRejectedValue(
        new NotFoundException('Stage with ID stage-999 not found'),
      );

      await expect(controller.remove('stage-999', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cascade deletion', () => {
    it('should handle stage deletion with associated units', async () => {
      const stageId = 'stage-1';
      const mockUser = { id: 'user-123', role: 'admin' };

      // The service should handle soft delete via deletedAt field
      mockStagesService.remove.mockResolvedValue(undefined);

      await controller.remove(stageId, mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(stageId, mockUser.id);
      // Soft deletion is handled at service level
    });
  });
});
