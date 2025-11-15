import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { Company, CompanyStatus, CompanyType, TaxRegime } from '../entities/company.entity';
import { NotFoundException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

describe('CompanyController', () => {
  let controller: CompanyController;
  let companyService: CompanyService;

  const mockCompanyService = {
    createCompanyFromRequest: jest.fn(),
    getCompaniesByUser: jest.fn(),
    getCompaniesByAccountant: jest.fn(),
    getCompanyDetails: jest.fn(),
    updateCompany: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
    },
  };

  const mockCompany: Partial<Company> = {
    id: 'company-001',
    legalName: 'My Company LTDA',
    tradeName: 'My Company',
    cnpj: '12.345.678/0001-90',
    companyType: CompanyType.LTDA,
    mainActivity: '6201-5/00 - Desenvolvimento de programas',
    taxRegime: TaxRegime.SIMPLES_NACIONAL,
    openingDate: new Date('2024-01-15'),
    estimatedRevenue: 100000,
    status: CompanyStatus.ACTIVE,
    userId: 'user-123',
    accountantId: 'accountant-456',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Sala 4',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
    companyService = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCompany', () => {
    const createCompanyDto: CreateCompanyDto = {
      legalName: 'My Company LTDA',
      tradeName: 'My Company',
      cnpj: '12.345.678/0001-90',
      companyType: CompanyType.LTDA,
      mainActivity: '6201-5/00 - Desenvolvimento de programas de computador',
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

    const requestId = 'request-789';

    it('should create a company from registration request', async () => {
      mockCompanyService.createCompanyFromRequest.mockResolvedValue(mockCompany);

      const result = await controller.createCompany(requestId, createCompanyDto);

      expect(mockCompanyService.createCompanyFromRequest).toHaveBeenCalledWith(
        requestId,
        createCompanyDto,
      );
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException when request does not exist', async () => {
      mockCompanyService.createCompanyFromRequest.mockRejectedValue(
        new NotFoundException('Registration request not found'),
      );

      await expect(controller.createCompany(requestId, createCompanyDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMyCompanies', () => {
    it('should return all companies for authenticated user', async () => {
      const mockCompanies = [mockCompany, { ...mockCompany, id: 'company-002' }];
      mockCompanyService.getCompaniesByUser.mockResolvedValue(mockCompanies);

      const result = await controller.getMyCompanies(mockRequest);

      expect(mockCompanyService.getCompaniesByUser).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no companies', async () => {
      mockCompanyService.getCompaniesByUser.mockResolvedValue([]);

      const result = await controller.getMyCompanies(mockRequest);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getAccountantCompanies', () => {
    it('should return all companies managed by authenticated accountant', async () => {
      const mockCompanies = [mockCompany, { ...mockCompany, id: 'company-002' }];
      mockCompanyService.getCompaniesByAccountant.mockResolvedValue(mockCompanies);

      const result = await controller.getAccountantCompanies(mockRequest);

      expect(mockCompanyService.getCompaniesByAccountant).toHaveBeenCalledWith(
        mockRequest.user.id,
        undefined,
      );
      expect(result).toEqual(mockCompanies);
      expect(result).toHaveLength(2);
    });

    it('should filter companies by status when provided', async () => {
      const activeCompanies = [mockCompany];
      mockCompanyService.getCompaniesByAccountant.mockResolvedValue(activeCompanies);

      const result = await controller.getAccountantCompanies(mockRequest, CompanyStatus.ACTIVE);

      expect(mockCompanyService.getCompaniesByAccountant).toHaveBeenCalledWith(
        mockRequest.user.id,
        CompanyStatus.ACTIVE,
      );
      expect(result).toEqual(activeCompanies);
    });

    it('should return empty array when accountant has no companies', async () => {
      mockCompanyService.getCompaniesByAccountant.mockResolvedValue([]);

      const result = await controller.getAccountantCompanies(mockRequest);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCompanyById', () => {
    const companyId = 'company-001';

    it('should return company details with relations', async () => {
      const detailedCompany = {
        ...mockCompany,
        user: { id: 'user-123', name: 'John Doe' },
        accountant: { id: 'accountant-456', name: 'Jane Smith' },
      };

      mockCompanyService.getCompanyDetails.mockResolvedValue(detailedCompany);

      const result = await controller.getCompanyById(companyId);

      expect(mockCompanyService.getCompanyDetails).toHaveBeenCalledWith(companyId);
      expect(result).toEqual(detailedCompany);
      expect(result.user).toBeDefined();
      expect(result.accountant).toBeDefined();
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyService.getCompanyDetails.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.getCompanyById(companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCompany', () => {
    const companyId = 'company-001';

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
      const updatedCompany = {
        ...mockCompany,
        ...updateCompanyDto,
      };

      mockCompanyService.updateCompany.mockResolvedValue(updatedCompany);

      const result = await controller.updateCompany(companyId, updateCompanyDto);

      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, updateCompanyDto);
      expect(result).toEqual(updatedCompany);
      expect(result.tradeName).toBe('Updated Trade Name');
      expect(result.taxRegime).toBe(TaxRegime.LUCRO_PRESUMIDO);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyService.updateCompany.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(controller.updateCompany(companyId, updateCompanyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow partial updates', async () => {
      const partialUpdate = { estimatedRevenue: 150000 };
      const updatedCompany = { ...mockCompany, estimatedRevenue: 150000 };

      mockCompanyService.updateCompany.mockResolvedValue(updatedCompany);

      const result = await controller.updateCompany(companyId, partialUpdate);

      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith(companyId, partialUpdate);
      expect(result.estimatedRevenue).toBe(150000);
    });
  });
});
