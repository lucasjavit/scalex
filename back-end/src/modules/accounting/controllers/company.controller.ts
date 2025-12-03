import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { CompanyStatus } from '../entities/accounting-company.entity';

/**
 * CompanyController
 *
 * Handles company management after successful CNPJ opening.
 *
 * Endpoints:
 * - POST   /api/accounting/companies/:requestId     - Create company from registration request
 * - GET    /api/accounting/companies/my-companies   - List user's companies
 * - GET    /api/accounting/companies/accountant     - List accountant's companies
 * - GET    /api/accounting/companies/:id            - Get company details
 * - PATCH  /api/accounting/companies/:id            - Update company information
 *
 * All routes protected with FirebaseAuthGuard.
 *
 * Business Flow:
 * 1. Accountant completes CNPJ opening process
 * 2. Accountant creates company record via POST /:requestId
 * 3. Request status automatically updated to COMPLETED
 * 4. User and accountant can view company details
 * 5. Authorized users can update company information
 */
@Controller('accounting/companies')
@UseGuards(FirebaseAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Create a company from a registration request
   *
   * Called by accountant after successfully opening CNPJ.
   * Automatically marks the registration request as completed.
   *
   * @param requestId - Registration request ID
   * @param createCompanyDto - Company information
   * @returns Created accounting company
   */
  @Post(':requestId')
  async createCompany(
    @Param('requestId') requestId: string,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return await this.companyService.createCompanyFromRequest(requestId, createCompanyDto);
  }

  /**
   * Get all companies owned by authenticated user
   *
   * Returns companies with accountant and request relations.
   * Ordered by creation date (newest first).
   *
   * @param req - Request with authenticated user
   * @returns Array of user's companies
   */
  @Get('my-companies')
  async getMyCompanies(@Req() req: any) {
    return await this.companyService.getCompaniesByUser(req.user.id);
  }

  /**
   * Get all companies managed by authenticated accountant
   *
   * Returns companies with user and request relations.
   * Optional status filter via query parameter.
   * Ordered by creation date (newest first).
   *
   * @param req - Request with authenticated accountant
   * @param status - Optional status filter (active, inactive, suspended)
   * @returns Array of accountant's companies
   */
  @Get('accountant')
  async getAccountantCompanies(@Req() req: any, @Query('status') status?: CompanyStatus) {
    return await this.companyService.getCompaniesByAccountant(req.user.id, status);
  }

  /**
   * Search companies by user CPF
   *
   * Allows accountants to find all companies owned by a client
   * using only their CPF. This is more practical than searching by user ID.
   *
   * Use Case:
   * - Accountant wants to upload monthly taxes for a client
   * - Searches by client's CPF to get all their companies
   * - Selects the appropriate company to upload taxes
   *
   * Returns companies with full relations (user, accountant, request).
   * Ordered by creation date (newest first).
   *
   * @param cpf - User's CPF (can be formatted: 123.456.789-00 or raw: 12345678900)
   * @returns Array of companies owned by the user with that CPF
   *
   * Example: GET /api/accounting/companies/by-cpf/12345678900
   */
  @Get('by-cpf/:cpf')
  async getCompaniesByCpf(@Param('cpf') cpf: string) {
    return await this.companyService.findCompaniesByUserCpf(cpf);
  }

  /**
   * Get detailed information about a company
   *
   * Returns company with all relations (user, accountant, request).
   *
   * @param id - Company ID
   * @returns Company details
   */
  @Get(':id')
  async getCompanyById(@Param('id') id: string) {
    return await this.companyService.getCompanyDetails(id);
  }

  /**
   * Update company information
   *
   * Allows partial updates of company data.
   * Cannot update CNPJ or company type (immutable after creation).
   *
   * @param id - Company ID
   * @param updateData - Partial company data to update
   * @returns Updated company
   */
  @Patch(':id')
  async updateCompany(@Param('id') id: string, @Body() updateData: Partial<CreateCompanyDto>) {
    return await this.companyService.updateCompany(id, updateData);
  }
}
