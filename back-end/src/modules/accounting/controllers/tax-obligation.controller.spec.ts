import { Test, TestingModule } from '@nestjs/testing';
import { TaxObligationController } from './tax-obligation.controller';
import { TaxObligationService } from '../services/tax-obligation.service';
import {
  TaxType,
  TaxObligationStatus,
} from '../entities/tax-obligation.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

describe('TaxObligationController', () => {
  let controller: TaxObligationController;
  let service: TaxObligationService;

  const mockTaxObligationService = {
    createTaxObligation: jest.fn(),
    getTaxObligationsByCompany: jest.fn(),
    confirmPayment: jest.fn(),
    updateTaxObligation: jest.fn(),
    getTaxObligationById: jest.fn(),
    cancelTaxObligation: jest.fn(),
  };

  const mockUser = {
    uid: 'user-123',
    email: 'accountant@test.com',
    role: 'accountant',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxObligationController],
      providers: [
        {
          provide: TaxObligationService,
          useValue: mockTaxObligationService,
        },
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaxObligationController>(TaxObligationController);
    service = module.get<TaxObligationService>(TaxObligationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTaxObligation', () => {
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
      const mockTax = {
        id: 'tax-001',
        ...createDto,
        generatedById: mockUser.uid,
        totalAmount: 500.0,
        status: TaxObligationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaxObligationService.createTaxObligation.mockResolvedValue(mockTax);

      const result = await controller.createTaxObligation(mockUser, createDto);

      expect(mockTaxObligationService.createTaxObligation).toHaveBeenCalledWith(
        mockUser.uid,
        createDto,
      );
      expect(result).toEqual(mockTax);
    });

    it('should throw NotFoundException when company not found', async () => {
      mockTaxObligationService.createTaxObligation.mockRejectedValue(
        new NotFoundException('Company not found'),
      );

      await expect(
        controller.createTaxObligation(mockUser, createDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyCompanyTaxObligations', () => {
    const companyId = 'company-123';

    it('should return all tax obligations for a company', async () => {
      const mockTaxes = [
        {
          id: 'tax-1',
          companyId,
          taxType: TaxType.DAS,
          status: TaxObligationStatus.PENDING,
          amount: 500.0,
          totalAmount: 500.0,
        },
        {
          id: 'tax-2',
          companyId,
          taxType: TaxType.DARF,
          status: TaxObligationStatus.PAID,
          amount: 300.0,
          totalAmount: 300.0,
        },
      ];

      mockTaxObligationService.getTaxObligationsByCompany.mockResolvedValue(
        mockTaxes,
      );

      const result = await controller.getMyCompanyTaxObligations(companyId);

      expect(
        mockTaxObligationService.getTaxObligationsByCompany,
      ).toHaveBeenCalledWith(companyId, undefined);
      expect(result).toEqual(mockTaxes);
      expect(result).toHaveLength(2);
    });

    it('should filter by status when provided', async () => {
      const mockTaxes = [
        {
          id: 'tax-1',
          companyId,
          status: TaxObligationStatus.PENDING,
        },
      ];

      mockTaxObligationService.getTaxObligationsByCompany.mockResolvedValue(
        mockTaxes,
      );

      const result = await controller.getMyCompanyTaxObligations(
        companyId,
        TaxObligationStatus.PENDING,
      );

      expect(
        mockTaxObligationService.getTaxObligationsByCompany,
      ).toHaveBeenCalledWith(companyId, TaxObligationStatus.PENDING);
      expect(result).toEqual(mockTaxes);
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
        amount: 500.0,
        totalAmount: 500.0,
      };

      mockTaxObligationService.getTaxObligationById.mockResolvedValue(mockTax);

      const result = await controller.getTaxObligationById(taxId);

      expect(mockTaxObligationService.getTaxObligationById).toHaveBeenCalledWith(
        taxId,
      );
      expect(result).toEqual(mockTax);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxObligationService.getTaxObligationById.mockRejectedValue(
        new NotFoundException('Tax obligation not found'),
      );

      await expect(controller.getTaxObligationById(taxId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmPayment', () => {
    const taxId = 'tax-123';
    const confirmDto = {
      paidAmount: 500.0,
      paymentConfirmation: 'CONF-12345',
    };

    it('should confirm payment successfully', async () => {
      const mockTax = {
        id: taxId,
        amount: 500.0,
        status: TaxObligationStatus.PAID,
        paidAmount: 500.0,
        paymentConfirmation: 'CONF-12345',
        paidAt: new Date(),
      };

      mockTaxObligationService.confirmPayment.mockResolvedValue(mockTax);

      const result = await controller.confirmPayment(taxId, confirmDto);

      expect(mockTaxObligationService.confirmPayment).toHaveBeenCalledWith(
        taxId,
        confirmDto,
      );
      expect(result.status).toBe(TaxObligationStatus.PAID);
      expect(result.paidAmount).toBe(500.0);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxObligationService.confirmPayment.mockRejectedValue(
        new NotFoundException('Tax obligation not found'),
      );

      await expect(controller.confirmPayment(taxId, confirmDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when already paid', async () => {
      mockTaxObligationService.confirmPayment.mockRejectedValue(
        new BadRequestException('Tax obligation is already paid'),
      );

      await expect(controller.confirmPayment(taxId, confirmDto)).rejects.toThrow(
        BadRequestException,
      );
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
      const mockTax = {
        id: taxId,
        amount: 600.0,
        fineAmount: 30.0,
        interestAmount: 0,
        totalAmount: 630.0,
        notes: 'Updated amount',
        status: TaxObligationStatus.PENDING,
      };

      mockTaxObligationService.updateTaxObligation.mockResolvedValue(mockTax);

      const result = await controller.updateTaxObligation(taxId, updateDto);

      expect(mockTaxObligationService.updateTaxObligation).toHaveBeenCalledWith(
        taxId,
        updateDto,
      );
      expect(result.amount).toBe(600.0);
      expect(result.fineAmount).toBe(30.0);
      expect(result.totalAmount).toBe(630.0);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxObligationService.updateTaxObligation.mockRejectedValue(
        new NotFoundException('Tax obligation not found'),
      );

      await expect(
        controller.updateTaxObligation(taxId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelTaxObligation', () => {
    const taxId = 'tax-123';

    it('should cancel tax obligation successfully', async () => {
      const mockTax = {
        id: taxId,
        status: TaxObligationStatus.CANCELLED,
      };

      mockTaxObligationService.cancelTaxObligation.mockResolvedValue(mockTax);

      const result = await controller.cancelTaxObligation(taxId);

      expect(mockTaxObligationService.cancelTaxObligation).toHaveBeenCalledWith(
        taxId,
      );
      expect(result.status).toBe(TaxObligationStatus.CANCELLED);
    });

    it('should throw NotFoundException when tax not found', async () => {
      mockTaxObligationService.cancelTaxObligation.mockRejectedValue(
        new NotFoundException('Tax obligation not found'),
      );

      await expect(controller.cancelTaxObligation(taxId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when trying to cancel paid tax', async () => {
      mockTaxObligationService.cancelTaxObligation.mockRejectedValue(
        new BadRequestException('Cannot cancel a paid tax obligation'),
      );

      await expect(controller.cancelTaxObligation(taxId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
