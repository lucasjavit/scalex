import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxObligation, TaxObligationStatus } from '../entities/tax-obligation.entity';
import { Company } from '../entities/company.entity';
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
  constructor(
    @InjectRepository(TaxObligation)
    private readonly taxRepository: Repository<TaxObligation>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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

    // Create tax obligation
    const taxObligation = this.taxRepository.create({
      ...createDto,
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
   * @returns List of tax obligations
   */
  async getTaxObligationsByCompany(
    companyId: string,
    status?: TaxObligationStatus,
  ): Promise<TaxObligation[]> {
    const where: any = { companyId };

    if (status) {
      where.status = status;
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
}
