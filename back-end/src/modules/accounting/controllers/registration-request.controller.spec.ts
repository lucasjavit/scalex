import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { RegistrationRequestController } from './registration-request.controller';
import { RegistrationRequestService } from '../services/registration-request.service';
import { CreateRegistrationRequestDto, CompanyType, UrgencyLevel } from '../dto/create-registration-request.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';
import { RequestStatus } from '../entities/company-registration-request.entity';

describe('RegistrationRequestController', () => {
  let controller: RegistrationRequestController;
  let service: RegistrationRequestService;

  const mockService = {
    createRequest: jest.fn(),
    getRequestsByUser: jest.fn(),
    getRequestsByAccountant: jest.fn(),
    getRequestById: jest.fn(),
    updateRequestStatus: jest.fn(),
    assignAccountant: jest.fn(),
    getAccountantPendingRequests: jest.fn(),
    getAccountantActiveRequests: jest.fn(),
    getAccountantCompletedRequests: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationRequestController],
      providers: [
        {
          provide: RegistrationRequestService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(require('../../../common/guards/firebase-auth.guard').FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RegistrationRequestController>(RegistrationRequestController);
    service = module.get<RegistrationRequestService>(RegistrationRequestService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRequest', () => {
    const createDto: CreateRegistrationRequestDto = {
      full_name: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      business_type: 'Software',
      estimated_revenue: 'R$ 10k/mês',
      will_have_employees: false,
      preferred_company_type: CompanyType.MEI,
      has_commercial_address: false,
      address: {
        street: 'Rua A',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        neighborhood: 'Centro',
      },
      urgency: UrgencyLevel.MEDIUM,
    };

    it('should create a new request', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        status: RequestStatus.PENDING,
        requestData: createDto,
      };

      const req = { user: { id: 'user1' } };
      mockService.createRequest.mockResolvedValue(mockRequest);

      const result = await controller.createRequest(req, createDto);

      expect(service.createRequest).toHaveBeenCalledWith('user1', createDto);
      expect(result).toEqual(mockRequest);
    });
  });

  describe('getMyRequests', () => {
    it('should return user requests', async () => {
      const mockRequests = [
        { id: '1', userId: 'user1', status: RequestStatus.PENDING },
        { id: '2', userId: 'user1', status: RequestStatus.IN_PROGRESS },
      ];

      const req = { user: { id: 'user1' } };
      mockService.getRequestsByUser.mockResolvedValue(mockRequests);

      const result = await controller.getMyRequests(req);

      expect(service.getRequestsByUser).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getMyAssignedRequests', () => {
    it('should return accountant assigned requests', async () => {
      const mockRequests = [
        { id: '1', assignedToId: 'acc1' },
        { id: '2', assignedToId: 'acc1' },
      ];

      const req = { user: { id: 'acc1', role: 'partner_cnpj' } };
      mockService.getRequestsByAccountant.mockResolvedValue(mockRequests);

      const result = await controller.getMyAssignedRequests(req);

      expect(service.getRequestsByAccountant).toHaveBeenCalledWith('acc1');
      expect(result).toEqual(mockRequests);
    });

    it('should throw ForbiddenException if user is not accountant', async () => {
      const req = { user: { id: 'user1', role: 'user' } };

      await expect(controller.getMyAssignedRequests(req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRequestById', () => {
    it('should return request if user is owner', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: null,
      };

      const req = { user: { id: 'user1' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.getRequestById('123', req);

      expect(service.getRequestById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockRequest);
    });

    it('should return request if user is assigned accountant', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: 'acc1',
      };

      const req = { user: { id: 'acc1', role: 'partner_cnpj' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.getRequestById('123', req);

      expect(result).toEqual(mockRequest);
    });

    it('should throw ForbiddenException if user is not owner or assigned', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: 'acc1',
      };

      const req = { user: { id: 'user2' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);

      await expect(controller.getRequestById('123', req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateRequestStatus', () => {
    const updateDto: UpdateRequestStatusDto = {
      status: RequestStatus.IN_PROGRESS,
      status_note: 'Iniciando processo',
    };

    it('should allow accountant to update status', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: 'acc1',
      };

      const req = { user: { id: 'acc1', role: 'partner_cnpj' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);
      mockService.updateRequestStatus.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.IN_PROGRESS,
      });

      const result = await controller.updateRequestStatus('123', updateDto, req);

      expect(service.updateRequestStatus).toHaveBeenCalledWith('123', updateDto);
      expect(result.status).toBe(RequestStatus.IN_PROGRESS);
    });

    it('should allow user to cancel their request', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: 'acc1',
      };

      const cancelDto: UpdateRequestStatusDto = {
        status: RequestStatus.CANCELLED,
      };

      const req = { user: { id: 'user1', role: 'user' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);
      mockService.updateRequestStatus.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.CANCELLED,
      });

      const result = await controller.updateRequestStatus('123', cancelDto, req);

      expect(service.updateRequestStatus).toHaveBeenCalledWith('123', cancelDto);
    });

    it('should not allow user to update status other than cancel', async () => {
      const mockRequest = {
        id: '123',
        userId: 'user1',
        assignedToId: 'acc1',
      };

      const req = { user: { id: 'user1', role: 'user' } };
      mockService.getRequestById.mockResolvedValue(mockRequest);

      await expect(
        controller.updateRequestStatus('123', updateDto, req),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignAccountant', () => {
    it('should allow admin to assign accountant', async () => {
      const mockRequest = {
        id: '123',
        assignedToId: 'acc1',
      };

      const req = { user: { id: 'admin1', role: 'admin' } };
      mockService.assignAccountant.mockResolvedValue(mockRequest);

      const result = await controller.assignAccountant('123', 'acc1', req);

      expect(service.assignAccountant).toHaveBeenCalledWith('123', 'acc1');
      expect(result).toEqual(mockRequest);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const req = { user: { id: 'user1', role: 'user' } };

      await expect(controller.assignAccountant('123', 'acc1', req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getAccountantPendingRequests', () => {
    it('should return pending requests for authenticated accountant', async () => {
      const mockRequests = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
      ];

      const req = { user: { id: 'accountant1' } };
      mockService.getAccountantPendingRequests.mockResolvedValue(mockRequests);

      const result = await controller.getAccountantPendingRequests(req);

      expect(service.getAccountantPendingRequests).toHaveBeenCalledWith('accountant1');
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getAccountantActiveRequests', () => {
    it('should return active requests for authenticated accountant', async () => {
      const mockRequests = [
        { id: '1', status: 'in_progress' },
        { id: '2', status: 'waiting_documents' },
        { id: '3', status: 'processing' },
      ];

      const req = { user: { id: 'accountant1' } };
      mockService.getAccountantActiveRequests.mockResolvedValue(mockRequests);

      const result = await controller.getAccountantActiveRequests(req);

      expect(service.getAccountantActiveRequests).toHaveBeenCalledWith('accountant1');
      expect(result).toEqual(mockRequests);
    });
  });

  describe('getAccountantCompletedRequests', () => {
    it('should return completed requests for authenticated accountant', async () => {
      const mockRequests = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'cancelled' },
      ];

      const req = { user: { id: 'accountant1' } };
      mockService.getAccountantCompletedRequests.mockResolvedValue(mockRequests);

      const result = await controller.getAccountantCompletedRequests(req);

      expect(service.getAccountantCompletedRequests).toHaveBeenCalledWith('accountant1');
      expect(result).toEqual(mockRequests);
    });
  });
});
