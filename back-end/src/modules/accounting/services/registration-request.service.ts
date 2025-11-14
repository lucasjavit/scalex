import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRegistrationRequest, RequestStatus } from '../entities/company-registration-request.entity';
import { User } from '../../../users/entities/user.entity';
import { CreateRegistrationRequestDto } from '../dto/create-registration-request.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';

/**
 * Service for managing company registration requests
 *
 * Handles the business logic for:
 * - Creating registration requests
 * - Assigning accountants to requests
 * - Updating request status
 * - Finding requests by user or accountant
 */
@Injectable()
export class RegistrationRequestService {
  constructor(
    @InjectRepository(CompanyRegistrationRequest)
    private readonly requestRepository: Repository<CompanyRegistrationRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new company registration request
   *
   * @param userId - ID of the user creating the request
   * @param createDto - Request data from form
   * @returns Created registration request
   */
  async createRequest(
    userId: string,
    createDto: CreateRegistrationRequestDto,
  ): Promise<CompanyRegistrationRequest> {
    // Create request with PENDING status
    const request = this.requestRepository.create({
      userId,
      status: RequestStatus.PENDING,
      requestData: createDto,
    });

    // Save to database
    return await this.requestRepository.save(request);
  }

  /**
   * Get all requests for a specific user
   *
   * @param userId - ID of the user
   * @returns Array of registration requests
   */
  async getRequestsByUser(userId: string): Promise<CompanyRegistrationRequest[]> {
    return await this.requestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['assignedTo'],
    });
  }

  /**
   * Get a specific request by ID
   *
   * @param requestId - ID of the request
   * @returns Registration request
   * @throws NotFoundException if request not found
   */
  async getRequestById(requestId: string): Promise<CompanyRegistrationRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['user', 'assignedTo'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    return request;
  }

  /**
   * Update the status of a registration request
   *
   * @param requestId - ID of the request
   * @param updateDto - New status and optional note
   * @returns Updated registration request
   * @throws NotFoundException if request not found
   */
  async updateRequestStatus(
    requestId: string,
    updateDto: UpdateRequestStatusDto,
  ): Promise<CompanyRegistrationRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    // Update status
    request.status = updateDto.status;

    // Set completedAt if status is COMPLETED
    if (updateDto.status === RequestStatus.COMPLETED) {
      request.completedAt = new Date();
    }

    // Set cancelledAt if status is CANCELLED
    if (updateDto.status === RequestStatus.CANCELLED) {
      request.cancelledAt = new Date();
    }

    // Save and return
    await request.save();
    return request;
  }

  /**
   * Assign an accountant to a registration request
   *
   * @param requestId - ID of the request
   * @param accountantId - ID of the accountant (partner_cnpj user)
   * @returns Updated registration request
   * @throws NotFoundException if request or accountant not found
   * @throws BadRequestException if request already assigned
   */
  async assignAccountant(
    requestId: string,
    accountantId: string,
  ): Promise<CompanyRegistrationRequest> {
    // Find request
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }

    // Check if already assigned
    if (request.assignedToId) {
      throw new BadRequestException('Request already assigned to an accountant');
    }

    // Verify accountant exists and has correct role
    const accountant = await this.userRepository.findOne({
      where: { id: accountantId },
    });

    if (!accountant) {
      throw new NotFoundException(`Accountant with ID ${accountantId} not found`);
    }

    // Assign accountant and update status
    request.assignedToId = accountantId;
    request.status = RequestStatus.IN_PROGRESS;

    // Save and return
    await request.save();
    return request;
  }

  /**
   * Get all requests assigned to a specific accountant
   *
   * @param accountantId - ID of the accountant
   * @returns Array of registration requests
   */
  async getRequestsByAccountant(accountantId: string): Promise<CompanyRegistrationRequest[]> {
    return await this.requestRepository.find({
      where: { assignedToId: accountantId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Find the accountant with the least active requests
   * (Used for automatic assignment)
   *
   * @returns ID of the accountant with least requests, or null if none found
   */
  async findAvailableAccountant(): Promise<string | null> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'partner_cnpj' })
      .select('user.id', 'userId')
      .addSelect('COUNT(request.id)', 'requestCount')
      .leftJoin(
        'company_registration_requests',
        'request',
        'request.assigned_to = user.id AND request.status IN (:...activeStatuses)',
        {
          activeStatuses: [
            RequestStatus.IN_PROGRESS,
            RequestStatus.WAITING_DOCUMENTS,
            RequestStatus.PROCESSING,
          ],
        },
      )
      .groupBy('user.id')
      .orderBy('requestCount', 'ASC')
      .limit(1)
      .getRawOne();

    return result ? result.userId : null;
  }
}
