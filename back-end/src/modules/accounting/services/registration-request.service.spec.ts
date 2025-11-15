import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RegistrationRequestService } from './registration-request.service';
import { CompanyRegistrationRequest, RequestStatus } from '../entities/company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';
import { CreateRegistrationRequestDto, CompanyType, UrgencyLevel } from '../dto/create-registration-request.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';

describe('RegistrationRequestService', () => {
  let service: RegistrationRequestService;
  let requestRepository: Repository<CompanyRegistrationRequest>;
  let userRepository: Repository<User>;

  const mockRequestRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationRequestService,
        {
          provide: getRepositoryToken(CompanyRegistrationRequest),
          useValue: mockRequestRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<RegistrationRequestService>(RegistrationRequestService);
    requestRepository = module.get<Repository<CompanyRegistrationRequest>>(
      getRepositoryToken(CompanyRegistrationRequest),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequest', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const createDto: CreateRegistrationRequestDto = {
      full_name: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      business_type: 'Desenvolvimento de Software',
      estimated_revenue: 'Até R$ 10.000/mês',
      will_have_employees: false,
      preferred_company_type: CompanyType.MEI,
      has_commercial_address: false,
      address: {
        street: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        neighborhood: 'Centro',
      },
      urgency: UrgencyLevel.MEDIUM,
      notes: 'Preciso de ajuda com o processo',
    };

    it('should create a new registration request', async () => {
      const mockRequest = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        userId,
        status: RequestStatus.PENDING,
        requestData: createDto,
        createdAt: new Date(),
      };

      mockRequestRepository.create.mockReturnValue(mockRequest);
      mockRequestRepository.save.mockResolvedValue(mockRequest);

      const result = await service.createRequest(userId, createDto);

      expect(requestRepository.create).toHaveBeenCalledWith({
        userId,
        status: RequestStatus.PENDING,
        requestData: createDto,
      });
      expect(requestRepository.save).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockRequest);
    });

    it('should throw error if save fails', async () => {
      mockRequestRepository.create.mockReturnValue({});
      mockRequestRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createRequest(userId, createDto)).rejects.toThrow();
    });
  });

  describe('getRequestsByUser', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return all requests for a user', async () => {
      const mockRequests = [
        {
          id: '1',
          userId,
          status: RequestStatus.PENDING,
          requestData: {},
        },
        {
          id: '2',
          userId,
          status: RequestStatus.IN_PROGRESS,
          requestData: {},
        },
      ];

      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.getRequestsByUser(userId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        relations: ['assignedTo'],
      });
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array if user has no requests', async () => {
      mockRequestRepository.find.mockResolvedValue([]);

      const result = await service.getRequestsByUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getRequestById', () => {
    const requestId = '123e4567-e89b-12d3-a456-426614174001';

    it('should return a request by id', async () => {
      const mockRequest = {
        id: requestId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        status: RequestStatus.PENDING,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      const result = await service.getRequestById(requestId);

      expect(requestRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestId },
        relations: ['user', 'assignedTo'],
      });
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if request not found', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.getRequestById(requestId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRequestStatus', () => {
    const requestId = '123e4567-e89b-12d3-a456-426614174001';
    const updateDto: UpdateRequestStatusDto = {
      status: RequestStatus.IN_PROGRESS,
      status_note: 'Iniciando análise',
    };

    it('should update request status', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        save: jest.fn().mockResolvedValue(true),
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      const result = await service.updateRequestStatus(requestId, updateDto);

      expect(mockRequest.status).toBe(RequestStatus.IN_PROGRESS);
      expect(mockRequest.save).toHaveBeenCalled();
      expect(result).toEqual(mockRequest);
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.PROCESSING,
        completedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const completeDto: UpdateRequestStatusDto = {
        status: RequestStatus.COMPLETED,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await service.updateRequestStatus(requestId, completeDto);

      expect(mockRequest.status).toBe(RequestStatus.COMPLETED);
      expect(mockRequest.completedAt).toBeInstanceOf(Date);
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should set cancelledAt when status is CANCELLED', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.IN_PROGRESS,
        cancelledAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const cancelDto: UpdateRequestStatusDto = {
        status: RequestStatus.CANCELLED,
        status_note: 'Cliente desistiu',
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await service.updateRequestStatus(requestId, cancelDto);

      expect(mockRequest.status).toBe(RequestStatus.CANCELLED);
      expect(mockRequest.cancelledAt).toBeInstanceOf(Date);
      expect(mockRequest.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if request not found', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRequestStatus(requestId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignAccountant', () => {
    const requestId = '123e4567-e89b-12d3-a456-426614174001';
    const accountantId = '123e4567-e89b-12d3-a456-426614174002';

    it('should assign accountant to request', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
        assignedToId: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAccountant = {
        id: accountantId,
        role: 'partner_cnpj',
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockUserRepository.findOne.mockResolvedValue(mockAccountant);

      const result = await service.assignAccountant(requestId, accountantId);

      expect(mockRequest.assignedToId).toBe(accountantId);
      expect(mockRequest.status).toBe(RequestStatus.IN_PROGRESS);
      expect(mockRequest.save).toHaveBeenCalled();
      expect(result).toEqual(mockRequest);
    });

    it('should throw NotFoundException if accountant not found', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.PENDING,
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.assignAccountant(requestId, accountantId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if request already assigned', async () => {
      const mockRequest = {
        id: requestId,
        status: RequestStatus.IN_PROGRESS,
        assignedToId: '123e4567-e89b-12d3-a456-426614174003',
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);

      await expect(service.assignAccountant(requestId, accountantId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRequestsByAccountant', () => {
    const accountantId = '123e4567-e89b-12d3-a456-426614174002';

    it('should return all requests assigned to accountant', async () => {
      const mockRequests = [
        {
          id: '1',
          assignedToId: accountantId,
          status: RequestStatus.IN_PROGRESS,
        },
        {
          id: '2',
          assignedToId: accountantId,
          status: RequestStatus.WAITING_DOCUMENTS,
        },
      ];

      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.getRequestsByAccountant(accountantId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: { assignedToId: accountantId },
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
      expect(result).toEqual(mockRequests);
    });
  });

  describe('findAvailableAccountant', () => {
    it('should find accountant with least active requests', async () => {
      const mockAccountants = [
        { id: '1', role: 'partner_cnpj' },
        { id: '2', role: 'partner_cnpj' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ userId: '1' }),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAvailableAccountant();

      expect(result).toBe('1');
    });

    it('should return null if no accountants available', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAvailableAccountant();

      expect(result).toBeNull();
    });
  });

  describe('getAccountantPendingRequests', () => {
    const accountantId = '123e4567-e89b-12d3-a456-426614174002';

    it('should return pending requests for accountant', async () => {
      const mockRequests = [
        {
          id: '1',
          assignedToId: accountantId,
          status: RequestStatus.PENDING,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.getAccountantPendingRequests(accountantId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          assignedToId: accountantId,
          status: RequestStatus.PENDING,
        },
        order: { createdAt: 'ASC' },
        relations: ['user'],
      });
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no pending requests', async () => {
      mockRequestRepository.find.mockResolvedValue([]);

      const result = await service.getAccountantPendingRequests(accountantId);

      expect(result).toEqual([]);
    });
  });

  describe('getAccountantActiveRequests', () => {
    const accountantId = '123e4567-e89b-12d3-a456-426614174002';

    it('should return active requests for accountant', async () => {
      const mockRequests = [
        {
          id: '1',
          assignedToId: accountantId,
          status: RequestStatus.IN_PROGRESS,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: '2',
          assignedToId: accountantId,
          status: RequestStatus.WAITING_DOCUMENTS,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '3',
          assignedToId: accountantId,
          status: RequestStatus.PROCESSING,
          createdAt: new Date('2024-01-03'),
        },
      ];

      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.getAccountantActiveRequests(accountantId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          assignedToId: accountantId,
          status: expect.any(Object), // In() operator
        },
        order: { createdAt: 'DESC' },
        relations: ['user'],
      });
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no active requests', async () => {
      mockRequestRepository.find.mockResolvedValue([]);

      const result = await service.getAccountantActiveRequests(accountantId);

      expect(result).toEqual([]);
    });
  });

  describe('getAccountantCompletedRequests', () => {
    const accountantId = '123e4567-e89b-12d3-a456-426614174002';

    it('should return completed and cancelled requests for accountant', async () => {
      const mockRequests = [
        {
          id: '1',
          assignedToId: accountantId,
          status: RequestStatus.COMPLETED,
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: '2',
          assignedToId: accountantId,
          status: RequestStatus.CANCELLED,
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockRequestRepository.find.mockResolvedValue(mockRequests);

      const result = await service.getAccountantCompletedRequests(accountantId);

      expect(requestRepository.find).toHaveBeenCalledWith({
        where: {
          assignedToId: accountantId,
          status: expect.any(Object), // In() operator
        },
        order: { updatedAt: 'DESC' },
        relations: ['user'],
      });
      expect(result).toEqual(mockRequests);
    });

    it('should return empty array when no completed requests', async () => {
      mockRequestRepository.find.mockResolvedValue([]);

      const result = await service.getAccountantCompletedRequests(accountantId);

      expect(result).toEqual([]);
    });
  });
});
