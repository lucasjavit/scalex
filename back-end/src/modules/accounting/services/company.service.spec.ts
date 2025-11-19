import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyService } from './company.service';
import { AccountingCompany, CompanyStatus, CompanyType, TaxRegime } from '../entities/accounting-company.entity';
import { CompanyRegistrationRequest, RequestStatus } from '../entities/company-registration-request.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: Repository<AccountingCompany>;
  let requestRepository: Repository<CompanyRegistrationRequest>;

  const mockCompanyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRequestRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(AccountingCompany),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(CompanyRegistrationRequest),
          useValue: mockRequestRepository,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    companyRepository = module.get<Repository<AccountingCompany>>(getRepositoryToken(AccountingCompany));
    requestRepository = module.get<Repository<CompanyRegistrationRequest>>(
      getRepositoryToken(CompanyRegistrationRequest),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompanyFromRequest', () => {
    const userId = 'user-123';
    const accountantId = 'accountant-456';
    const requestId = 'request-789';

    const mockRequest = {
      id: requestId,
      userId,
      assignedToId: accountantId,
      status: RequestStatus.IN_PROGRESS,
      desiredCompanyType: CompanyType.LTDA,
      desiredTradeName: 'My Company',
      estimatedRevenue: 100000,
      mainActivityDescription: 'Software Development',
    } as unknown as CompanyRegistrationRequest;

    const createCompanyDto = {
      legalName: 'My Company LTDA',
      tradeName: 'My Company',
      cnpj: '12.345.678/0001-90',
      companyType: CompanyType.LTDA,
      mainActivity: '6201-5/00 - Desenvolvimento de programas de computador sob encomenda',
      taxRegime: TaxRegime.SIMPLES_NACIONAL,
      openingDate: '2024-01-15',
      estimatedRevenue: 100000,
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Sala 4',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
      stateRegistration: '123.456.789.012',
      municipalRegistration: '9876543',
    };

    it('should create a company and update request to completed', async () => {
      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      // CNPJ doesn't exist yet
      mockCompanyRepository.findOne.mockResolvedValue(null);

      const savedCompany = {
        id: 'company-001',
        ...createCompanyDto,
        userId,
        accountantId,
        requestId,
        status: CompanyStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompanyRepository.create.mockReturnValue(savedCompany);
      mockCompanyRepository.save.mockResolvedValue(savedCompany);

      const updatedRequest = { ...mockRequest, status: RequestStatus.COMPLETED };
      mockRequestRepository.save.mockResolvedValue(updatedRequest);

      const result = await service.createCompanyFromRequest(requestId, createCompanyDto);

      expect(mockRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestId },
      });

      expect(mockCompanyRepository.create).toHaveBeenCalledWith({
        ...createCompanyDto,
        userId,
        accountantId,
        requestId,
        status: CompanyStatus.ACTIVE,
      });

      expect(mockCompanyRepository.save).toHaveBeenCalledWith(savedCompany);

      expect(mockRequestRepository.save).toHaveBeenCalledWith({
        ...mockRequest,
        status: RequestStatus.COMPLETED,
      });

      expect(result).toEqual(savedCompany);
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.createCompanyFromRequest(requestId, createCompanyDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: requestId },
      });

      expect(mockCompanyRepository.create).not.toHaveBeenCalled();
      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when request is already completed', async () => {
      const completedRequest = { ...mockRequest, status: RequestStatus.COMPLETED };
      mockRequestRepository.findOne.mockResolvedValue(completedRequest);

      await expect(service.createCompanyFromRequest(requestId, createCompanyDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCompanyRepository.create).not.toHaveBeenCalled();
      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when CNPJ already exists', async () => {
      // Setup: request exists and is IN_PROGRESS (use fresh copy to avoid mutation)
      const freshRequest = { ...mockRequest, status: RequestStatus.IN_PROGRESS };
      mockRequestRepository.findOne.mockResolvedValue(freshRequest);

      // Setup: CNPJ already exists in database
      const existingCompany = { id: 'existing-company', cnpj: createCompanyDto.cnpj };
      mockCompanyRepository.findOne.mockResolvedValue(existingCompany);

      await expect(service.createCompanyFromRequest(requestId, createCompanyDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj: createCompanyDto.cnpj },
      });

      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getCompaniesByUser', () => {
    const userId = 'user-123';

    it('should return all companies for a user', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          legalName: 'Company One LTDA',
          cnpj: '11.111.111/0001-11',
          status: CompanyStatus.ACTIVE,
          userId,
        },
        {
          id: 'company-2',
          legalName: 'Company Two ME',
          cnpj: '22.222.222/0001-22',
          status: CompanyStatus.ACTIVE,
          userId,
        },
      ];

      mockCompanyRepository.find.mockResolvedValue(mockCompanies);

      const result = await service.getCompaniesByUser(userId);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
        relations: ['accountant', 'request'],
      });

      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no companies', async () => {
      mockCompanyRepository.find.mockResolvedValue([]);

      const result = await service.getCompaniesByUser(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCompaniesByAccountant', () => {
    const accountantId = 'accountant-456';

    it('should return all companies managed by accountant', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          legalName: 'Company One LTDA',
          cnpj: '11.111.111/0001-11',
          status: CompanyStatus.ACTIVE,
          accountantId,
        },
        {
          id: 'company-2',
          legalName: 'Company Two ME',
          cnpj: '22.222.222/0001-22',
          status: CompanyStatus.ACTIVE,
          accountantId,
        },
      ];

      mockCompanyRepository.find.mockResolvedValue(mockCompanies);

      const result = await service.getCompaniesByAccountant(accountantId);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: { accountantId },
        order: { createdAt: 'DESC' },
        relations: ['user', 'request'],
      });

      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when accountant has no companies', async () => {
      mockCompanyRepository.find.mockResolvedValue([]);

      const result = await service.getCompaniesByAccountant(accountantId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should filter by status when provided', async () => {
      const activeCompanies = [
        {
          id: 'company-1',
          legalName: 'Active Company',
          status: CompanyStatus.ACTIVE,
          accountantId,
        },
      ];

      mockCompanyRepository.find.mockResolvedValue(activeCompanies);

      const result = await service.getCompaniesByAccountant(accountantId, CompanyStatus.ACTIVE);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: { accountantId, status: CompanyStatus.ACTIVE },
        order: { createdAt: 'DESC' },
        relations: ['user', 'request'],
      });

      expect(result).toEqual(activeCompanies);
    });
  });

  describe('getCompanyDetails', () => {
    const companyId = 'company-123';

    it('should return company details with all relations', async () => {
      const mockCompany = {
        id: companyId,
        legalName: 'My Company LTDA',
        cnpj: '12.345.678/0001-90',
        status: CompanyStatus.ACTIVE,
        user: { id: 'user-123', name: 'John Doe' },
        accountant: { id: 'accountant-456', name: 'Jane Smith' },
        request: { id: 'request-789', status: RequestStatus.COMPLETED },
      };

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.getCompanyDetails(companyId);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
        relations: ['user', 'accountant', 'request'],
      });

      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.getCompanyDetails(companyId)).rejects.toThrow(NotFoundException);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
        relations: ['user', 'accountant', 'request'],
      });
    });
  });

  describe('updateCompany', () => {
    const companyId = 'company-123';

    const updateCompanyDto = {
      tradeName: 'Updated Trade Name',
      taxRegime: TaxRegime.LUCRO_PRESUMIDO,
      estimatedRevenue: 200000,
      address: {
        street: 'Rua Nova',
        number: '456',
        neighborhood: 'Bairro Novo',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
      },
    };

    it('should update company information', async () => {
      const existingCompany = {
        id: companyId,
        legalName: 'My Company LTDA',
        cnpj: '12.345.678/0001-90',
        tradeName: 'Old Trade Name',
        taxRegime: TaxRegime.SIMPLES_NACIONAL,
        estimatedRevenue: 100000,
        address: {
          street: 'Rua Velha',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        status: CompanyStatus.ACTIVE,
      };

      mockCompanyRepository.findOne.mockResolvedValue(existingCompany);

      const updatedCompany = {
        ...existingCompany,
        ...updateCompanyDto,
        updatedAt: new Date(),
      };

      mockCompanyRepository.save.mockResolvedValue(updatedCompany);

      const result = await service.updateCompany(companyId, updateCompanyDto);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
      });

      expect(mockCompanyRepository.save).toHaveBeenCalledWith({
        ...existingCompany,
        ...updateCompanyDto,
      });

      expect(result).toEqual(updatedCompany);
      expect(result.tradeName).toBe('Updated Trade Name');
      expect(result.taxRegime).toBe(TaxRegime.LUCRO_PRESUMIDO);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCompany(companyId, updateCompanyDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
      });

      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      const existingCompany = {
        id: companyId,
        legalName: 'My Company LTDA',
        tradeName: 'Original Trade Name',
        estimatedRevenue: 100000,
      };

      mockCompanyRepository.findOne.mockResolvedValue(existingCompany);

      const partialUpdate = { estimatedRevenue: 150000 };
      const updatedCompany = { ...existingCompany, ...partialUpdate };

      mockCompanyRepository.save.mockResolvedValue(updatedCompany);

      const result = await service.updateCompany(companyId, partialUpdate);

      expect(result.estimatedRevenue).toBe(150000);
      expect(result.tradeName).toBe('Original Trade Name'); // Unchanged
    });
  });

  describe('getCompanyByCnpj', () => {
    const cnpj = '12.345.678/0001-90';

    it('should return company by CNPJ', async () => {
      const mockCompany = {
        id: 'company-123',
        cnpj,
        legalName: 'My Company LTDA',
        status: CompanyStatus.ACTIVE,
      };

      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.getCompanyByCnpj(cnpj);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { cnpj },
      });

      expect(result).toEqual(mockCompany);
    });

    it('should return null when CNPJ not found', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      const result = await service.getCompanyByCnpj(cnpj);

      expect(result).toBeNull();
    });
  });

  describe('updateCompanyStatus', () => {
    const companyId = 'company-123';

    it('should update company status to inactive', async () => {
      const existingCompany = {
        id: companyId,
        legalName: 'My Company LTDA',
        status: CompanyStatus.ACTIVE,
      };

      mockCompanyRepository.findOne.mockResolvedValue(existingCompany);

      const updatedCompany = {
        ...existingCompany,
        status: CompanyStatus.INACTIVE,
        updatedAt: new Date(),
      };

      mockCompanyRepository.save.mockResolvedValue(updatedCompany);

      const result = await service.updateCompanyStatus(companyId, CompanyStatus.INACTIVE);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: companyId },
      });

      expect(mockCompanyRepository.save).toHaveBeenCalledWith({
        ...existingCompany,
        status: CompanyStatus.INACTIVE,
      });

      expect(result.status).toBe(CompanyStatus.INACTIVE);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCompanyStatus(companyId, CompanyStatus.SUSPENDED),
      ).rejects.toThrow(NotFoundException);

      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findCompaniesByUserCpf', () => {
    const cpf = '123.456.789-00';

    it('should return all companies for a user identified by CPF', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          legalName: 'Company One LTDA',
          cnpj: '11.111.111/0001-11',
          status: CompanyStatus.ACTIVE,
          userId: 'user-123',
          user: {
            id: 'user-123',
            name: 'John Doe',
            cpf: '123.456.789-00',
          },
        },
        {
          id: 'company-2',
          legalName: 'Company Two ME',
          cnpj: '22.222.222/0001-22',
          status: CompanyStatus.ACTIVE,
          userId: 'user-123',
          user: {
            id: 'user-123',
            name: 'John Doe',
            cpf: '123.456.789-00',
          },
        },
      ];

      mockCompanyRepository.find.mockResolvedValue(mockCompanies);

      const result = await service.findCompaniesByUserCpf(cpf);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: {
          user: { cpf },
        },
        relations: ['user', 'accountant', 'request'],
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no companies found for CPF', async () => {
      mockCompanyRepository.find.mockResolvedValue([]);

      const result = await service.findCompaniesByUserCpf(cpf);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: {
          user: { cpf },
        },
        relations: ['user', 'accountant', 'request'],
        order: { createdAt: 'DESC' },
      });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle CPF with different formatting', async () => {
      const formattedCpf = '12345678900'; // Without dots and dash
      mockCompanyRepository.find.mockResolvedValue([]);

      await service.findCompaniesByUserCpf(formattedCpf);

      expect(mockCompanyRepository.find).toHaveBeenCalledWith({
        where: {
          user: { cpf: formattedCpf },
        },
        relations: ['user', 'accountant', 'request'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should include all company relations (user, accountant, request)', async () => {
      const mockCompany = {
        id: 'company-1',
        legalName: 'Full Company LTDA',
        cnpj: '11.111.111/0001-11',
        status: CompanyStatus.ACTIVE,
        userId: 'user-123',
        accountantId: 'accountant-456',
        requestId: 'request-789',
        user: {
          id: 'user-123',
          name: 'John Doe',
          cpf,
          email: 'john@example.com',
        },
        accountant: {
          id: 'accountant-456',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        request: {
          id: 'request-789',
          status: RequestStatus.COMPLETED,
        },
      };

      mockCompanyRepository.find.mockResolvedValue([mockCompany]);

      const result = await service.findCompaniesByUserCpf(cpf);

      expect(result[0]).toHaveProperty('user');
      expect(result[0]).toHaveProperty('accountant');
      expect(result[0]).toHaveProperty('request');
      expect(result[0].user.cpf).toBe(cpf);
    });
  });
});
