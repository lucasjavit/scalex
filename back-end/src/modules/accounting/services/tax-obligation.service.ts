import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxObligation, TaxObligationStatus } from '../entities/tax-obligation.entity';
import { AccountingCompany } from '../entities/accounting-company.entity';
import { CreateTaxObligationDto } from '../dto/create-tax-obligation.dto';
import { UpdateTaxObligationDto } from '../dto/update-tax-obligation.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';

/**
 * TaxObligationService
 *
 * Manages tax obligations for companies.
 * Accountants generate monthly tax obligations (DAS, DARF, GPS, etc.)
 * and company owners pay them.
 *
 * Features:
 * - Create tax obligations with automatic total calculation
 * - List tax obligations by company with optional status filter
 * - Confirm payment with timestamp
 * - Update tax obligations (amount, fine, interest)
 * - Cancel tax obligations (only if not paid)
 * - Comprehensive validation and error handling
 */
@Injectable()
export class TaxObligationService {
  private readonly logger = new Logger(TaxObligationService.name);

  constructor(
    @InjectRepository(TaxObligation)
    private readonly taxRepository: Repository<TaxObligation>,
    @InjectRepository(AccountingCompany)
    private readonly companyRepository: Repository<AccountingCompany>,
  ) {}

  /**
   * Create a new tax obligation
   *
   * @param accountantId - ID of the accountant generating the obligation
   * @param createDto - Tax obligation data
   * @returns Created tax obligation
   * @throws NotFoundException if company not found
   */
  async createTaxObligation(
    accountantId: string,
    createDto: CreateTaxObligationDto,
  ): Promise<TaxObligation> {
    // Validate company exists
    const company = await this.companyRepository.findOne({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${createDto.companyId} not found`);
    }

    // Calculate total amount
    const amount = Number(createDto.amount);
    const fineAmount = Number(createDto.fineAmount || 0);
    const interestAmount = Number(createDto.interestAmount || 0);
    const totalAmount = amount + fineAmount + interestAmount;

    // Parse referenceMonth (format: YYYY-MM) into month and year
    const [year, month] = createDto.referenceMonth.split('-').map(Number);

    // Create tax obligation
    const taxObligation = this.taxRepository.create({
      companyId: createDto.companyId,
      taxType: createDto.taxType,
      referenceMonth: month,
      referenceYear: year,
      dueDate: createDto.dueDate,
      amount: createDto.amount,
      fineAmount,
      interestAmount,
      barcode: createDto.barcode,
      paymentLink: createDto.paymentLink,
      documentUrl: createDto.documentUrl,
      notes: createDto.notes,
      generatedById: accountantId,
      totalAmount,
      status: TaxObligationStatus.PENDING,
    });

    return await this.taxRepository.save(taxObligation);
  }

  /**
   * Get all tax obligations for a company
   *
   * @param companyId - Company ID
   * @param status - Optional status filter
   * @param referenceMonth - Optional month filter (1-12)
   * @param referenceYear - Optional year filter
   * @returns List of tax obligations
   */
  async getTaxObligationsByCompany(
    companyId: string,
    status?: TaxObligationStatus,
    referenceMonth?: number,
    referenceYear?: number,
  ): Promise<TaxObligation[]> {
    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (referenceMonth !== undefined) {
      where.referenceMonth = referenceMonth;
    }

    if (referenceYear !== undefined) {
      where.referenceYear = referenceYear;
    }

    return await this.taxRepository.find({
      where,
      order: { dueDate: 'DESC' },
      relations: ['generatedBy'],
    });
  }

  /**
   * Confirm payment of a tax obligation
   *
   * @param taxId - Tax obligation ID
   * @param confirmDto - Payment confirmation data
   * @returns Updated tax obligation
   * @throws NotFoundException if tax not found
   * @throws BadRequestException if already paid
   */
  async confirmPayment(taxId: string, confirmDto: ConfirmPaymentDto): Promise<TaxObligation> {
    const taxObligation = await this.taxRepository.findOne({
      where: { id: taxId },
    });

    if (!taxObligation) {
      throw new NotFoundException(`Tax obligation with ID ${taxId} not found`);
    }

    if (taxObligation.status === TaxObligationStatus.PAID) {
      throw new BadRequestException('Tax obligation is already paid');
    }

    // Update payment information
    taxObligation.status = TaxObligationStatus.PAID;
    taxObligation.paidAmount = confirmDto.paidAmount;
    taxObligation.paymentConfirmation = confirmDto.paymentConfirmation;
    taxObligation.paidAt = new Date();

    return await this.taxRepository.save(taxObligation);
  }

  /**
   * Update a tax obligation
   *
   * @param taxId - Tax obligation ID
   * @param updateDto - Update data
   * @returns Updated tax obligation
   * @throws NotFoundException if tax not found
   */
  async updateTaxObligation(
    taxId: string,
    updateDto: UpdateTaxObligationDto,
  ): Promise<TaxObligation> {
    const taxObligation = await this.taxRepository.findOne({
      where: { id: taxId },
    });

    if (!taxObligation) {
      throw new NotFoundException(`Tax obligation with ID ${taxId} not found`);
    }

    // Update fields
    Object.assign(taxObligation, updateDto);

    // Recalculate total amount if any amount fields changed
    if (
      updateDto.amount !== undefined ||
      updateDto.fineAmount !== undefined ||
      updateDto.interestAmount !== undefined
    ) {
      const amount = Number(updateDto.amount ?? taxObligation.amount);
      const fineAmount = Number(updateDto.fineAmount ?? taxObligation.fineAmount);
      const interestAmount = Number(updateDto.interestAmount ?? taxObligation.interestAmount);
      taxObligation.totalAmount = amount + fineAmount + interestAmount;
    }

    return await this.taxRepository.save(taxObligation);
  }

  /**
   * Get a single tax obligation by ID
   *
   * @param taxId - Tax obligation ID
   * @returns Tax obligation with relations
   * @throws NotFoundException if tax not found
   */
  async getTaxObligationById(taxId: string): Promise<TaxObligation> {
    const taxObligation = await this.taxRepository.findOne({
      where: { id: taxId },
      relations: ['company', 'generatedBy'],
    });

    if (!taxObligation) {
      throw new NotFoundException(`Tax obligation with ID ${taxId} not found`);
    }

    return taxObligation;
  }

  /**
   * Cancel a tax obligation
   *
   * @param taxId - Tax obligation ID
   * @returns Cancelled tax obligation
   * @throws NotFoundException if tax not found
   * @throws BadRequestException if already paid
   */
  async cancelTaxObligation(taxId: string): Promise<TaxObligation> {
    const taxObligation = await this.taxRepository.findOne({
      where: { id: taxId },
    });

    if (!taxObligation) {
      throw new NotFoundException(`Tax obligation with ID ${taxId} not found`);
    }

    if (taxObligation.status === TaxObligationStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid tax obligation');
    }

    taxObligation.status = TaxObligationStatus.CANCELLED;

    return await this.taxRepository.save(taxObligation);
  }

  /**
   * Upload monthly tax PDF
   *
   * Accountants upload government-generated tax PDFs (DAS, DARF, GPS, etc.)
   * for a specific company, month, and year. The PDF file is stored and
   * metadata is saved to the database.
   *
   * @param accountantId - ID of the accountant uploading the tax
   * @param uploadDto - Tax obligation data (company, type, month, year, amounts)
   * @param file - Uploaded PDF file (from Multer)
   * @returns Created tax obligation with file metadata
   * @throws NotFoundException if company not found
   * @throws BadRequestException if file is not PDF, or tax already exists for same month/year
   */
  async uploadMonthlyTaxPdf(
    accountantId: string,
    uploadDto: any,
    file: Express.Multer.File,
  ): Promise<TaxObligation> {
    this.logger.log('=== SERVICE: uploadMonthlyTaxPdf - START ===');
    this.logger.log(`AccountantId: ${accountantId}`);
    this.logger.log(`UploadDto: ${JSON.stringify(uploadDto)}`);
    this.logger.log(`File: ${JSON.stringify({
      filename: file?.filename,
      path: file?.path,
      mimetype: file?.mimetype,
      size: file?.size,
    })}`);

    // Validate company exists
    this.logger.log(`Looking for company: ${uploadDto.companyId}`);
    const company = await this.companyRepository.findOne({
      where: { id: uploadDto.companyId },
    });

    if (!company) {
      this.logger.error(`Company not found: ${uploadDto.companyId}`);
      throw new NotFoundException(`Company with ID ${uploadDto.companyId} not found`);
    }
    this.logger.log(`Company found: ${company.tradeName}`);

    // Validate file is PDF
    if (file.mimetype !== 'application/pdf') {
      this.logger.error(`Invalid mimetype: ${file.mimetype}`);
      throw new BadRequestException('Only PDF files are allowed');
    }

    // Validate reference month (1-12)
    const refMonth = Number(uploadDto.referenceMonth);
    const refYear = Number(uploadDto.referenceYear);
    this.logger.log(`Reference: ${refMonth}/${refYear}`);

    if (refMonth < 1 || refMonth > 12) {
      this.logger.error(`Invalid month: ${refMonth}`);
      throw new BadRequestException('Reference month must be between 1 and 12');
    }

    // Validate reference year (2000-2100)
    if (refYear < 2000 || refYear > 2100) {
      this.logger.error(`Invalid year: ${refYear}`);
      throw new BadRequestException('Reference year must be between 2000 and 2100');
    }

    // Check if tax already exists for this company, type, month, and year
    this.logger.log(`Checking for existing tax: ${uploadDto.taxType} - ${refMonth}/${refYear}`);
    const existingTax = await this.taxRepository.findOne({
      where: {
        companyId: uploadDto.companyId,
        taxType: uploadDto.taxType,
        referenceMonth: refMonth,
        referenceYear: refYear,
      },
    });

    if (existingTax) {
      this.logger.error(`Tax already exists: ${existingTax.id}`);
      throw new BadRequestException(
        `Tax obligation for ${uploadDto.taxType} already exists for ${refMonth}/${refYear}`,
      );
    }
    this.logger.log('No existing tax found - proceeding');

    // Calculate total amount
    const amount = Number(uploadDto.amount);
    const fineAmount = Number(uploadDto.fineAmount || 0);
    const interestAmount = Number(uploadDto.interestAmount || 0);
    const totalAmount = amount + fineAmount + interestAmount;
    this.logger.log(`Amounts: base=${amount}, fine=${fineAmount}, interest=${interestAmount}, total=${totalAmount}`);

    // Create tax obligation with file metadata
    this.logger.log('Creating tax obligation entity...');
    const taxObligation = this.taxRepository.create({
      companyId: uploadDto.companyId,
      taxType: uploadDto.taxType,
      referenceMonth: refMonth,
      referenceYear: refYear,
      dueDate: uploadDto.dueDate,
      amount: uploadDto.amount,
      fineAmount,
      interestAmount,
      barcode: uploadDto.barcode,
      paymentLink: uploadDto.paymentLink,
      notes: uploadDto.notes,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      generatedById: accountantId,
      totalAmount,
      status: TaxObligationStatus.PENDING,
    });

    this.logger.log(`Entity created: ${JSON.stringify({
      companyId: taxObligation.companyId,
      taxType: taxObligation.taxType,
      fileName: taxObligation.fileName,
      filePath: taxObligation.filePath,
      generatedById: taxObligation.generatedById,
    })}`);

    try {
      const saved = await this.taxRepository.save(taxObligation);
      this.logger.log(`Tax obligation saved with ID: ${saved.id}`);
      this.logger.log('=== SERVICE: uploadMonthlyTaxPdf - SUCCESS ===');
      return saved;
    } catch (error) {
      this.logger.error(`Failed to save tax obligation: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      this.logger.log('=== SERVICE: uploadMonthlyTaxPdf - ERROR ===');
      throw error;
    }
  }
}
