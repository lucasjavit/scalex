import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RegistrationRequestService } from '../services/registration-request.service';
import { CreateRegistrationRequestDto } from '../dto/create-registration-request.dto';
import { UpdateRequestStatusDto } from '../dto/update-request-status.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

/**
 * Controller for company registration requests
 *
 * Endpoints:
 * - POST /api/accounting/requests - Create new request
 * - GET /api/accounting/requests/my-requests - List user's requests
 * - GET /api/accounting/requests/:id - Get request details
 * - PATCH /api/accounting/requests/:id/status - Update request status
 * - PATCH /api/accounting/requests/:id/assign/:accountantId - Assign accountant
 * - GET /api/accounting/requests/accountant/my-assigned - List accountant's assigned requests
 *
 * Security:
 * - All routes protected with FirebaseAuthGuard
 * - User can only see their own requests
 * - Accountants can see assigned requests
 * - Only accountants can update status
 */
@Controller('accounting/requests')
@UseGuards(FirebaseAuthGuard)
export class RegistrationRequestController {
  constructor(
    private readonly registrationRequestService: RegistrationRequestService,
  ) {}

  /**
   * Create a new company registration request
   *
   * POST /api/accounting/requests
   *
   * @param req - Request with user info from FirebaseAuthGuard
   * @param createDto - Request data from form
   * @returns Created registration request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Req() req: any,
    @Body() createDto: CreateRegistrationRequestDto,
  ) {
    const userId = req.user.id; // Set by FirebaseAuthGuard
    return await this.registrationRequestService.createRequest(userId, createDto);
  }

  /**
   * Get all requests for the authenticated user
   *
   * GET /api/accounting/requests/my-requests
   *
   * @param req - Request with user info
   * @returns Array of user's registration requests
   */
  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  async getMyRequests(@Req() req: any) {
    const userId = req.user.id;
    return await this.registrationRequestService.getRequestsByUser(userId);
  }

  /**
   * Get all requests assigned to the authenticated accountant
   *
   * GET /api/accounting/requests/accountant/my-assigned
   *
   * @param req - Request with user info
   * @returns Array of accountant's assigned requests
   */
  @Get('accountant/my-assigned')
  @HttpCode(HttpStatus.OK)
  async getMyAssignedRequests(@Req() req: any) {
    const accountantId = req.user.id;

    // Verify user is an accountant (partner_cnpj role)
    if (req.user.role !== 'partner_cnpj') {
      throw new ForbiddenException('Only accountants can access assigned requests');
    }

    return await this.registrationRequestService.getRequestsByAccountant(accountantId);
  }

  /**
   * Get a specific request by ID
   *
   * GET /api/accounting/requests/:id
   *
   * @param id - Request ID
   * @param req - Request with user info
   * @returns Registration request details
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRequestById(@Param('id') id: string, @Req() req: any) {
    const request = await this.registrationRequestService.getRequestById(id);

    // Authorization: User can only see their own requests OR assigned accountant can see it
    const isOwner = request.userId === req.user.id;
    const isAssignedAccountant = request.assignedToId === req.user.id;

    if (!isOwner && !isAssignedAccountant) {
      throw new ForbiddenException('You do not have permission to view this request');
    }

    return request;
  }

  /**
   * Update the status of a registration request
   *
   * PATCH /api/accounting/requests/:id/status
   *
   * Only the assigned accountant or the user can update status:
   * - User can only cancel (status: CANCELLED)
   * - Accountant can update to any status
   *
   * @param id - Request ID
   * @param updateDto - New status and optional note
   * @param req - Request with user info
   * @returns Updated registration request
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequestStatusDto,
    @Req() req: any,
  ) {
    const request = await this.registrationRequestService.getRequestById(id);

    // Authorization checks
    const isOwner = request.userId === req.user.id;
    const isAssignedAccountant = request.assignedToId === req.user.id;
    const isAccountant = req.user.role === 'partner_cnpj';

    // User can only cancel their own request
    if (isOwner && !isAccountant) {
      if (updateDto.status !== 'cancelled') {
        throw new ForbiddenException('Users can only cancel their own requests');
      }
    }

    // Accountant must be assigned to the request
    if (isAccountant && !isAssignedAccountant && !isOwner) {
      throw new ForbiddenException('You are not assigned to this request');
    }

    // If not owner or assigned accountant, deny
    if (!isOwner && !isAssignedAccountant) {
      throw new ForbiddenException('You do not have permission to update this request');
    }

    return await this.registrationRequestService.updateRequestStatus(id, updateDto);
  }

  /**
   * Assign an accountant to a registration request
   *
   * PATCH /api/accounting/requests/:id/assign/:accountantId
   *
   * This is typically done automatically, but can be done manually by admins.
   *
   * @param id - Request ID
   * @param accountantId - Accountant user ID
   * @param req - Request with user info
   * @returns Updated registration request
   */
  @Patch(':id/assign/:accountantId')
  @HttpCode(HttpStatus.OK)
  async assignAccountant(
    @Param('id') id: string,
    @Param('accountantId') accountantId: string,
    @Req() req: any,
  ) {
    // Only admins can manually assign accountants
    // For auto-assignment, use a different endpoint or service method
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can manually assign accountants');
    }

    return await this.registrationRequestService.assignAccountant(id, accountantId);
  }
}
