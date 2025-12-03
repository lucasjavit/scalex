import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxObligationService } from './tax-obligation.service';
import {
  TaxObligation,
  TaxType,
  TaxObligationStatus,
} from '../entities/tax-obligation.entity';
import { AccountingCompany } from '../entities/accounting-company.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TaxObligationService', () => {
  let service: TaxObligationService;
  let taxRepository: Repository<TaxObligation>;
  let companyRepository: Repository<AccountingCompany>;

  const mockTaxRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCompanyRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxObligationService,
        {
          provide: getRepositoryToken(TaxObligation),
          useValue: mockTaxRepository,
        },
        {
          provide: getRepositoryToken(AccountingCompany),
          useValue: mockCompanyRepository,
        },
      ],
    }).compile();

    service = module.get<TaxObligationService>(TaxObligationService);
    taxRepository = module.get<Repository<TaxObligation>>(getRepositoryToken(TaxObligation));
    companyRepository = module.get<Repository<AccountingCompany>>(getRepositoryToken(AccountingCompany));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTaxObligation', () => {
    const accountantId = 'accountant-123';
    const createDto = {
      companyId: 'company-123',
      taxType: TaxType.DAS,
      referenceMonth: '2024-01',
      dueDate: '2024-02-20',
      amount: 500.0,
      fineAmount: 0,
      interestAmount: 0,
      barcode: '12345678901234567890',
      paymentLink: 'https://payment.com/12345',
      documentUrl: 'https://docs.com/das-2024-01.pdf',
      notes: 'DAS reference January 2024',
    };

    it('should create a tax obligation successfully', async () => {
      const mockCompany = { id: 'company-123', legalName: 'Test Company' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const savedTax = {
        id: 'tax-001',
        ...createDto,
        generatedById: accountantId,
        totalAmount: 500.0,
        status: TaxObligationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaxRepository.create.mockReturnValue(savedTax);
      mockTaxRepository.save.mockResolvedValue(savedTax);

      const result = await service.createTaxObligation(accountantId, createDto);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.companyId },
      });

      expect(mockTaxRepository.create).toHaveBeenCalledWith({
        ...createDto,
        generatedById: accountantId,
        totalAmount: 500.0,
        status: TaxObligationStatus.PENDING,
      });

      expect(result).toEqual(savedTax);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(service.createTaxObligation(accountantId, createDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockTaxRepository.create).not.toHaveBeenCalled();
    });

    it('should calculate total amount correctly with fine and interest', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const dtoWithFines = {
        ...createDto,
        fineAmount: 25.0,
        interestAmount: 10.5,
      };

      const savedTax = {
        ...dtoWithFines,
        totalAmount: 535.5, // 500 + 25 + 10.5
        generatedById: accountantId,
      };

      mockTaxRepository.create.mockReturnValue(savedTax);
      mockTaxRepository.save.mockResolvedValue(savedTax);

      const result = await service.createTaxObligation(accountantId, dtoWithFines);

      expect(result.totalAmount).toBe(535.5);
    });
  });

  describe('getTaxObligationsByCompany', () => {
    const companyId = 'company-123';

    it('should return all tax obligations for a company', async () => {
      const mockTaxes = [
        {
          id: 'tax-1',
          companyId,
          taxType: TaxType.DAS,
          status: TaxObligationStatus.PENDING,
        },
        {
          id: 'tax-2',
          companyId,
          taxType: TaxType.DARF,
          status: TaxObligationStatus.PAID,
        },
      ];

      mockTaxRepository.find.mockResolvedValue(mockTaxes);

      const result = await service.getTaxObligationsByCompany(companyId);

      expect(mockTaxRepository.find).toHaveBeenCalledWith({
        where: { companyId },
        order: { dueDate: 'DESC' },
        relations: ['generatedBy'],
      });

      expect(result).toEqual(mockTaxes);
      expect(result).toHaveLength(2);
    });

    it('should filter by status when provided', async () => {
      const pendingTaxes = [
        { id: 'tax-1', companyId, status: TaxObligationStatus.PENDING },
      ];

      mockTaxRepository.find.mockResolvedValue(pendingTaxes);

      const result = await service.getTaxObligationsByCompany(
        companyId,
        TaxObligationStatus.PENDING,
      );

      expect(mockTaxRepository.find).toHaveBeenCalledWith({
        where: { companyId, status: TaxObligationStatus.PENDING },
        order: { dueDate: 'DESC' },
        relations: ['generatedBy'],
      });

      expect(result).toEqual(pendingTaxes);
    });
  });

  describe('confirmPayment', () => {
    const taxId = 'tax-123';
    const confirmDto = {
      paidAmount: 500.0,
      paymentConfirmation: 'CONF-12345',
    };

    it('should confirm payment successfully', async () => {
      const existingTax = {
        id: taxId,
        amount: 500.0,
        status: TaxObligationStatus.PENDING,
      };

      mockTaxRepository.findOne.mockResolvedValue(existingTax);

      const updatedTax = {
        ...existingTax,
        ...confirmDto,
        status: TaxObligationStatus.PAID,
        paidAt: expect.any(Date),
      };

      mockTaxRepository.save.mockResolvedValue(updatedTax);

      const result = await service.confirmPayment(taxId, confirmDto);

      expect(mockTaxRepository.findOne).toHaveBeenCalledWith({
        where: { id: taxId },
      });

      expect(result.status).toBe(TaxObligationStatus.PAID);
      expect(result.paidAmount).toBe(500.0);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.confirmPayment(taxId, confirmDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already paid', async () => {
      const paidTax = {
        id: taxId,
        status: TaxObligationStatus.PAID,
      };

      mockTaxRepository.findOne.mockResolvedValue(paidTax);

      await expect(service.confirmPayment(taxId, confirmDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTaxObligation', () => {
    const taxId = 'tax-123';
    const updateDto = {
      amount: 600.0,
      fineAmount: 30.0,
      notes: 'Updated amount',
    };

    it('should update tax obligation successfully', async () => {
      const existingTax = {
        id: taxId,
        amount: 500.0,
        fineAmount: 0,
        interestAmount: 0,
        status: TaxObligationStatus.PENDING,
      };

      mockTaxRepository.findOne.mockResolvedValue(existingTax);

      const updatedTax = {
        ...existingTax,
        ...updateDto,
        totalAmount: 630.0, // 600 + 30 + 0
      };

      mockTaxRepository.save.mockResolvedValue(updatedTax);

      const result = await service.updateTaxObligation(taxId, updateDto);

      expect(result.amount).toBe(600.0);
      expect(result.fineAmount).toBe(30.0);
      expect(result.totalAmount).toBe(630.0);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTaxObligation(taxId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTaxObligationById', () => {
    const taxId = 'tax-123';

    it('should return tax obligation with relations', async () => {
      const mockTax = {
        id: taxId,
        taxType: TaxType.DAS,
        company: { id: 'company-123', legalName: 'Test Company' },
        generatedBy: { id: 'accountant-123', name: 'John Doe' },
      };

      mockTaxRepository.findOne.mockResolvedValue(mockTax);

      const result = await service.getTaxObligationById(taxId);

      expect(mockTaxRepository.findOne).toHaveBeenCalledWith({
        where: { id: taxId },
        relations: ['company', 'generatedBy'],
      });

      expect(result).toEqual(mockTax);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaxObligationById(taxId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelTaxObligation', () => {
    const taxId = 'tax-123';

    it('should cancel tax obligation successfully', async () => {
      const existingTax = {
        id: taxId,
        status: TaxObligationStatus.PENDING,
      };

      mockTaxRepository.findOne.mockResolvedValue(existingTax);

      const cancelledTax = {
        ...existingTax,
        status: TaxObligationStatus.CANCELLED,
      };

      mockTaxRepository.save.mockResolvedValue(cancelledTax);

      const result = await service.cancelTaxObligation(taxId);

      expect(result.status).toBe(TaxObligationStatus.CANCELLED);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelTaxObligation(taxId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to cancel paid tax', async () => {
      const paidTax = {
        id: taxId,
        status: TaxObligationStatus.PAID,
      };

      mockTaxRepository.findOne.mockResolvedValue(paidTax);

      await expect(service.cancelTaxObligation(taxId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadMonthlyTaxPdf', () => {
    const accountantId = 'accountant-123';
    const uploadDto = {
      companyId: 'company-123',
      taxType: TaxType.DAS,
      referenceMonth: 1, // Janeiro
      referenceYear: 2024,
      dueDate: new Date('2024-02-20'),
      amount: 500.0,
      barcode: '12345678901234567890',
      paymentLink: 'https://payment.com/12345',
      notes: 'DAS Janeiro 2024',
    };
    const mockFile = {
      originalname: 'DAS_JAN_2024.pdf',
      mimetype: 'application/pdf',
      size: 150000,
      path: 'uploads/tax-obligations/das-jan-2024-abc123.pdf',
      filename: 'das-jan-2024-abc123.pdf',
    } as Express.Multer.File;

    it('should upload monthly tax PDF successfully with all file metadata', async () => {
      const mockCompany = {
        id: 'company-123',
        legalName: 'Test Company LTDA',
        cnpj: '12345678000190',
      };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      // No existing tax for this month/year
      mockTaxRepository.findOne.mockResolvedValue(null);

      const savedTax = {
        id: 'tax-001',
        ...uploadDto,
        fileName: mockFile.filename,
        filePath: mockFile.path,
        fileSize: mockFile.size,
        mimeType: mockFile.mimetype,
        generatedById: accountantId,
        totalAmount: 500.0,
        fineAmount: 0,
        interestAmount: 0,
        status: TaxObligationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaxRepository.create.mockReturnValue(savedTax);
      mockTaxRepository.save.mockResolvedValue(savedTax);

      const result = await service.uploadMonthlyTaxPdf(accountantId, uploadDto, mockFile);

      expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
        where: { id: uploadDto.companyId },
      });

      expect(mockTaxRepository.findOne).toHaveBeenCalledWith({
        where: {
          companyId: uploadDto.companyId,
          taxType: uploadDto.taxType,
          referenceMonth: uploadDto.referenceMonth,
          referenceYear: uploadDto.referenceYear,
        },
      });

      expect(mockTaxRepository.create).toHaveBeenCalledWith({
        ...uploadDto,
        fileName: mockFile.filename,
        filePath: mockFile.path,
        fileSize: mockFile.size,
        mimeType: mockFile.mimetype,
        generatedById: accountantId,
        totalAmount: 500.0,
        fineAmount: 0,
        interestAmount: 0,
        status: TaxObligationStatus.PENDING,
      });

      expect(result).toEqual(savedTax);
      expect(result.fileName).toBe('das-jan-2024-abc123.pdf');
      expect(result.filePath).toBe('uploads/tax-obligations/das-jan-2024-abc123.pdf');
      expect(result.fileSize).toBe(150000);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompanyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadMonthlyTaxPdf(accountantId, uploadDto, mockFile),
      ).rejects.toThrow(NotFoundException);

      expect(mockTaxRepository.create).not.toHaveBeenCalled();
      expect(mockTaxRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is not PDF', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const invalidFile = {
        ...mockFile,
        mimetype: 'image/jpeg',
        originalname: 'document.jpg',
      } as Express.Multer.File;

      await expect(
        service.uploadMonthlyTaxPdf(accountantId, uploadDto, invalidFile),
      ).rejects.toThrow(BadRequestException);

      expect(mockTaxRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when tax for same month/year already exists', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const existingTax = {
        id: 'tax-existing',
        companyId: uploadDto.companyId,
        taxType: uploadDto.taxType,
        referenceMonth: uploadDto.referenceMonth,
        referenceYear: uploadDto.referenceYear,
        status: TaxObligationStatus.PENDING,
      };
      mockTaxRepository.findOne.mockResolvedValue(existingTax);

      await expect(
        service.uploadMonthlyTaxPdf(accountantId, uploadDto, mockFile),
      ).rejects.toThrow(BadRequestException);

      expect(mockTaxRepository.create).not.toHaveBeenCalled();
    });

    it('should calculate total amount correctly with fine and interest', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);
      mockTaxRepository.findOne.mockResolvedValue(null);

      const dtoWithFines = {
        ...uploadDto,
        fineAmount: 25.0,
        interestAmount: 10.5,
      };

      const savedTax = {
        ...dtoWithFines,
        fileName: mockFile.filename,
        filePath: mockFile.path,
        fileSize: mockFile.size,
        mimeType: mockFile.mimetype,
        totalAmount: 535.5, // 500 + 25 + 10.5
        generatedById: accountantId,
      };

      mockTaxRepository.create.mockReturnValue(savedTax);
      mockTaxRepository.save.mockResolvedValue(savedTax);

      const result = await service.uploadMonthlyTaxPdf(accountantId, dtoWithFines, mockFile);

      expect(result.totalAmount).toBe(535.5);
      expect(result.amount).toBe(500.0);
      expect(result.fineAmount).toBe(25.0);
      expect(result.interestAmount).toBe(10.5);
    });

    it('should validate reference month is between 1 and 12', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const invalidDto = {
        ...uploadDto,
        referenceMonth: 13, // Invalid month
      };

      await expect(
        service.uploadMonthlyTaxPdf(accountantId, invalidDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate reference year is in reasonable range', async () => {
      const mockCompany = { id: 'company-123' };
      mockCompanyRepository.findOne.mockResolvedValue(mockCompany);

      const invalidDto = {
        ...uploadDto,
        referenceYear: 1999, // Below 2000
      };

      await expect(
        service.uploadMonthlyTaxPdf(accountantId, invalidDto, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
