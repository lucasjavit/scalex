import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingMessage } from '../entities/accounting-message.entity';
import { CompanyRegistrationRequest } from '../entities/company-registration-request.entity';
import { SendMessageDto } from '../dto/send-message.dto';

/**
 * MessageService
 *
 * Handles chat/messaging between users and accountants.
 *
 * Features:
 * - Send messages (linked to request or company)
 * - Retrieve messages by request or company
 * - Mark messages as read
 * - Get unread message count
 *
 * Business Rules:
 * - Message must be linked to EITHER request OR company (XOR)
 * - Only receiver can mark message as read
 * - Messages ordered chronologically
 */
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(AccountingMessage)
    private readonly messageRepository: Repository<AccountingMessage>,
    @InjectRepository(CompanyRegistrationRequest)
    private readonly requestRepository: Repository<CompanyRegistrationRequest>,
  ) {}

  /**
   * Send a message
   *
   * @param senderId - User sending the message
   * @param dto - Message data
   * @returns Created message
   */
  async sendMessage(
    senderId: string,
    dto: SendMessageDto,
  ): Promise<AccountingMessage> {
    // Validate XOR constraint: message must belong to request OR company
    if (!dto.requestId && !dto.companyId) {
      throw new BadRequestException(
        'Message must be linked to either a request or a company',
      );
    }

    if (dto.requestId && dto.companyId) {
      throw new BadRequestException(
        'Message cannot be linked to both request and company',
      );
    }

    // Validate request exists (if requestId provided)
    if (dto.requestId) {
      const request = await this.requestRepository.findOne({
        where: { id: dto.requestId },
      });

      if (!request) {
        throw new NotFoundException(
          `Request with ID ${dto.requestId} not found`,
        );
      }
    }

    // TODO: Validate company exists (when Company entity is created in STEP 15)
    // if (dto.companyId) {
    //   const company = await this.companyRepository.findOne({
    //     where: { id: dto.companyId },
    //   });
    //   if (!company) {
    //     throw new NotFoundException(`Company with ID ${dto.companyId} not found`);
    //   }
    // }

    // Create and save message
    const message = this.messageRepository.create({
      requestId: dto.requestId || null,
      companyId: dto.companyId || null,
      senderId,
      receiverId: dto.receiverId,
      message: dto.message,
      attachmentPath: dto.attachment || null,
    });

    return await this.messageRepository.save(message);
  }

  /**
   * Get all messages for a registration request
   *
   * @param requestId - Request ID
   * @returns Array of messages ordered by createdAt
   */
  async getMessagesByRequest(requestId: string): Promise<AccountingMessage[]> {
    return await this.messageRepository.find({
      where: { requestId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get all messages for a company
   *
   * @param companyId - Company ID
   * @returns Array of messages ordered by createdAt
   */
  async getMessagesByCompany(companyId: string): Promise<AccountingMessage[]> {
    return await this.messageRepository.find({
      where: { companyId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Mark a message as read
   *
   * @param messageId - Message ID
   * @param userId - User marking as read (must be receiver)
   * @returns Updated message
   */
  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<AccountingMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      throw new BadRequestException(
        'Only the receiver can mark this message as read',
      );
    }

    // Update read status
    message.isRead = true;
    message.readAt = new Date();

    return await this.messageRepository.save(message);
  }

  /**
   * Get count of unread messages for a user
   *
   * @param userId - User ID
   * @returns Count of unread messages
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository
      .createQueryBuilder()
      .where('receiverId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .getCount();
  }
}
