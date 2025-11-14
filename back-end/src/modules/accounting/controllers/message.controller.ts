import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { FirebaseAuthGuard } from '../../../common/guards/firebase-auth.guard';

/**
 * MessageController
 *
 * REST API endpoints for chat/messaging functionality.
 *
 * All routes protected with FirebaseAuthGuard.
 *
 * Endpoints:
 * - POST   /api/accounting/messages                    // Send message
 * - GET    /api/accounting/messages/request/:id        // Get messages by request
 * - GET    /api/accounting/messages/company/:id        // Get messages by company
 * - PATCH  /api/accounting/messages/:id/read           // Mark as read
 * - GET    /api/accounting/messages/unread-count       // Get unread count
 */
@Controller('accounting/messages')
@UseGuards(FirebaseAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Send a message
   *
   * POST /api/accounting/messages
   *
   * @param req - Request with authenticated user
   * @param dto - Message data
   * @returns Created message
   */
  @Post()
  async sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    const senderId = req.user.id;
    return await this.messageService.sendMessage(senderId, dto);
  }

  /**
   * Get all messages for a registration request
   *
   * GET /api/accounting/messages/request/:id
   *
   * @param requestId - Request ID
   * @returns Array of messages
   */
  @Get('request/:id')
  async getMessagesByRequest(@Param('id') requestId: string) {
    return await this.messageService.getMessagesByRequest(requestId);
  }

  /**
   * Get all messages for a company
   *
   * GET /api/accounting/messages/company/:id
   *
   * @param companyId - Company ID
   * @returns Array of messages
   */
  @Get('company/:id')
  async getMessagesByCompany(@Param('id') companyId: string) {
    return await this.messageService.getMessagesByCompany(companyId);
  }

  /**
   * Mark a message as read
   *
   * PATCH /api/accounting/messages/:id/read
   *
   * @param messageId - Message ID
   * @param req - Request with authenticated user
   * @returns Updated message
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') messageId: string, @Req() req: any) {
    const userId = req.user.id;
    return await this.messageService.markAsRead(messageId, userId);
  }

  /**
   * Get count of unread messages for current user
   *
   * GET /api/accounting/messages/unread-count
   *
   * @param req - Request with authenticated user
   * @returns Object with count
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    const count = await this.messageService.getUnreadCount(userId);
    return { count };
  }
}
