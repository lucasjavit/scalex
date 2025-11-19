import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingCompany, CompanyStatus } from '../entities/accounting-company.entity';
import { CompanyRegistrationRequest, RequestStatus } from '../entities/company-registration-request.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';

/**
 * CompanyService
 *
 * Manages registered companies after successful CNPJ opening.
 *
 * Key Features:
 * - Create company from completed registration request
 * - List companies by user or accountant
 * - Get detailed company information
 * - Update company information
 * - Manage company status (active, inactive, suspended)
 *
 * Business Rules:
 * - CNPJ must be unique across all companies
 * - Can only create company from valid registration request
 * - Creating company automatically marks request as completed
 * - Company remains linked to original request and accountant
 */
@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(AccountingCompany)
    private readonly companyRepository: Repository<AccountingCompany>,
    @InjectRepository(CompanyRegistrationRequest)
    private readonly requestRepository: Repository<CompanyRegistrationRequest>,
  ) {}

  /**
   * Create a company from a registration request
   *
   * This is called when an accountant has successfully completed the CNPJ
   * opening process and wants to register the company in the system.
   *
   * Steps:
   * 1. Validate the registration request exists and is valid
   * 2. Check if CNPJ is unique
   * 3. Create the company record
   * 4. Update the request status to COMPLETED
   *
   * @param requestId - ID of the registration request
   * @param createCompanyDto - Company information
   * @returns Created accounting company
   * @throws NotFoundException if request not found
   * @throws BadRequestException if request already completed or CNPJ exists
   */
  async createCompanyFromRequest(
    requestId: string,
    createCompanyDto: CreateCompanyDto,
  ): Promise<AccountingCompany> {
    // Validate request exists
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Registration request with ID ${requestId} not found`);
    }

    // Check if request is already completed
    if (request.status === RequestStatus.COMPLETED) {
      throw new BadRequestException('This registration request has already been completed');
    }

    // Check if CNPJ already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new BadRequestException(`A company with CNPJ ${createCompanyDto.cnpj} already exists`);
    }

    // Create company
    const company = this.companyRepository.create({
      ...createCompanyDto,
      userId: request.userId,
      accountantId: request.assignedToId ?? undefined,
      requestId: request.id,
      status: CompanyStatus.ACTIVE,
    });

    const savedCompany = await this.companyRepository.save(company);

    // Update request status to completed
    request.status = RequestStatus.COMPLETED;
    request.completedAt = new Date();
    await this.requestRepository.save(request);

    return savedCompany;
  }

  /**
   * Get all companies owned by a user
   *
   * @param userId - User ID
   * @returns Array of companies with relations
   */
  async getCompaniesByUser(userId: string): Promise<AccountingCompany[]> {
    return await this.companyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['accountant', 'request'],
    });
  }

  /**
   * Get all companies managed by an accountant
   *
   * @param accountantId - Accountant ID
   * @param status - Optional status filter
   * @returns Array of companies with relations
   */
  async getCompaniesByAccountant(
    accountantId: string,
    status?: CompanyStatus,
  ): Promise<AccountingCompany[]> {
    const where: any = { accountantId };

    if (status) {
      where.status = status;
    }

    return await this.companyRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['user', 'request'],
    });
  }

  /**
   * Get detailed information about a company
   *
   * @param companyId - Company ID
   * @returns Company with all relations
   * @throws NotFoundException if company not found
   */
  async getCompanyDetails(companyId: string): Promise<AccountingCompany> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['user', 'accountant', 'request'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return company;
  }

  /**
   * Update company information
   *
   * Note: Cannot update CNPJ or company type after creation.
   * These fields are immutable once registered.
   *
   * @param companyId - Company ID
   * @param updateData - Partial company data to update
   * @returns Updated company
   * @throws NotFoundException if company not found
   */
  async updateCompany(companyId: string, updateData: Partial<CreateCompanyDto>): Promise<AccountingCompany> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Merge update data with existing company
    Object.assign(company, updateData);

    return await this.companyRepository.save(company);
  }

  /**
   * Get company by CNPJ
   *
   * Useful for checking if CNPJ is already registered.
   *
   * @param cnpj - CNPJ to search for
   * @returns Company or null if not found
   */
  async getCompanyByCnpj(cnpj: string): Promise<AccountingCompany | null> {
    return await this.companyRepository.findOne({
      where: { cnpj },
    });
  }

  /**
   * Update company status
   *
   * Used to mark companies as inactive or suspended.
   *
   * @param companyId - Company ID
   * @param status - New status
   * @returns Updated company
   * @throws NotFoundException if company not found
   */
  async updateCompanyStatus(companyId: string, status: CompanyStatus): Promise<AccountingCompany> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    company.status = status;

    return await this.companyRepository.save(company);
  }

  /**
   * Find all companies by user CPF
   *
   * Allows accountants to search for all companies owned by a client
   * using only their CPF. Returns all companies with full relations.
   *
   * Use Case:
   * - Accountant needs to manage monthly taxes for a client
   * - Instead of searching by user ID, search by CPF (more practical)
   * - Returns all companies to allow accountant to select which one
   *
   * @param cpf - User's CPF (can be formatted or raw)
   * @returns Array of companies owned by the user
   */
  async findCompaniesByUserCpf(cpf: string): Promise<AccountingCompany[]> {
    return await this.companyRepository.find({
      where: {
        user: { cpf },
      },
      relations: ['user', 'accountant', 'request'],
      order: { createdAt: 'DESC' },
    });
  }
}
