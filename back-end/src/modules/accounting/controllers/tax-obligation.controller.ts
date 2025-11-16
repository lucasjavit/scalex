import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaxObligationService } from '../services/tax-obligation.service';
import { CreateTaxObligationDto } from '../dto/create-tax-obligation.dto';
import { UpdateTaxObligationDto } from '../dto/update-tax-obligation.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { TaxObligation, TaxObligationStatus } from '../entities/tax-obligation.entity';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

/**
 * TaxObligationController
 *
 * Manages tax obligation endpoints for accountants and company owners.
 *
 * Accountant Features:
 * - Generate monthly tax obligations (DAS, DARF, GPS, etc.)
 * - Update tax obligations (amount, fines, interest)
 * - Cancel tax obligations
 *
 * Company Owner Features:
 * - View tax obligations for their companies
 * - Confirm payment with receipt/confirmation number
 * - Track payment status and overdue taxes
 *
 * All endpoints require authentication via Firebase Auth.
 */
@Controller('accounting/tax-obligations')
@UseGuards(FirebaseAuthGuard)
export class TaxObligationController {
  constructor(private readonly taxObligationService: TaxObligationService) {}

  /**
   * Create a new tax obligation
   *
   * POST /accounting/tax-obligations
   *
   * Used by accountants to generate monthly tax obligations for companies.
   *
   * @param user - Current authenticated user (accountant)
   * @param createDto - Tax obligation data
   * @returns Created tax obligation
   */
  @Post()
  async createTaxObligation(
    @CurrentUser() user: any,
    @Body() createDto: CreateTaxObligationDto,
  ): Promise<TaxObligation> {
    return this.taxObligationService.createTaxObligation(user.uid, createDto);
  }

  /**
   * Get tax obligations for a specific company
   *
   * GET /accounting/tax-obligations/company/:companyId
   *
   * Returns all tax obligations for a company with optional status filter.
   * Used by company owners to view their tax obligations.
   *
   * @param companyId - Company ID
   * @param status - Optional status filter (pending, paid, overdue, cancelled)
   * @returns List of tax obligations
   */
  @Get('company/:companyId')
  async getMyCompanyTaxObligations(
    @Param('companyId') companyId: string,
    @Query('status') status?: TaxObligationStatus,
  ): Promise<TaxObligation[]> {
    return this.taxObligationService.getTaxObligationsByCompany(companyId, status);
  }

  /**
   * Get a single tax obligation by ID
   *
   * GET /accounting/tax-obligations/:id
   *
   * Returns tax obligation details with company and accountant relations.
   *
   * @param id - Tax obligation ID
   * @returns Tax obligation with relations
   */
  @Get(':id')
  async getTaxObligationById(@Param('id') id: string): Promise<TaxObligation> {
    return this.taxObligationService.getTaxObligationById(id);
  }

  /**
   * Confirm payment of a tax obligation
   *
   * PATCH /accounting/tax-obligations/:id/confirm-payment
   *
   * Used by company owners to confirm they paid a tax obligation.
   * Updates status to PAID and records payment details.
   *
   * @param id - Tax obligation ID
   * @param confirmDto - Payment confirmation data
   * @returns Updated tax obligation
   */
  @Patch(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body() confirmDto: ConfirmPaymentDto,
  ): Promise<TaxObligation> {
    return this.taxObligationService.confirmPayment(id, confirmDto);
  }

  /**
   * Update a tax obligation
   *
   * PUT /accounting/tax-obligations/:id
   *
   * Used by accountants to update tax obligation details.
   * Commonly used to update amounts, fines, or notes.
   *
   * @param id - Tax obligation ID
   * @param updateDto - Update data
   * @returns Updated tax obligation
   */
  @Put(':id')
  async updateTaxObligation(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaxObligationDto,
  ): Promise<TaxObligation> {
    return this.taxObligationService.updateTaxObligation(id, updateDto);
  }

  /**
   * Cancel a tax obligation
   *
   * DELETE /accounting/tax-obligations/:id
   *
   * Used by accountants to cancel a tax obligation.
   * Cannot cancel if already paid.
   *
   * @param id - Tax obligation ID
   * @returns Cancelled tax obligation
   */
  @Delete(':id')
  async cancelTaxObligation(@Param('id') id: string): Promise<TaxObligation> {
    return this.taxObligationService.cancelTaxObligation(id);
  }
}
