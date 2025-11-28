import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ModuleType } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { UserPermission } from '../../users/entities/user-permission.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { getModuleByPartnerRole, getModuleConfig } from '../../common/config/module-chat.config';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
  ) {}

  /**
   * Send a message
   */
  async sendMessage(senderId: string, dto: SendMessageDto) {
    // Get sender and receiver
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: dto.receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    // Determine who is partner and who is user
    const moduleConfig = getModuleConfig(dto.moduleType);

    // Check actual roles (not admin-enhanced)
    const senderIsActualPartner = sender.role === moduleConfig.partnerRole;
    const receiverIsActualPartner = receiver.role === moduleConfig.partnerRole;
    const senderIsAdmin = sender.role === 'admin';
    const receiverIsAdmin = receiver.role === 'admin';
    const senderIsUser = sender.role === 'user';
    const receiverIsUser = receiver.role === 'user';

    console.log('📨 [sendMessage] Debug:', {
      senderId,
      senderRole: sender.role,
      receiverId: dto.receiverId,
      receiverRole: receiver.role,
      moduleType: dto.moduleType,
      partnerRole: moduleConfig.partnerRole,
      senderIsActualPartner,
      receiverIsActualPartner,
      senderIsAdmin,
      receiverIsAdmin,
      senderIsUser,
      receiverIsUser,
      'condition1 (partner->user)': senderIsActualPartner && receiverIsUser,
      'condition2 (user->partner)': senderIsUser && receiverIsActualPartner,
    });

    let partnerId: string;
    let userId: string;

    // Determine partner and user based on roles
    // Priority: actual partner role > admin (acting as partner) > user
    if (senderIsActualPartner && receiverIsUser) {
      // Partner sending to user
      partnerId = senderId;
      userId = dto.receiverId;
    } else if (senderIsUser && receiverIsActualPartner) {
      // User sending to partner
      partnerId = dto.receiverId;
      userId = senderId;
    } else if (senderIsActualPartner && receiverIsAdmin) {
      // Partner sending to admin - partner stays as partner, admin acts as user
      partnerId = senderId;
      userId = dto.receiverId;
    } else if (senderIsAdmin && receiverIsActualPartner) {
      // Admin sending to partner - admin acts as user, partner stays as partner
      partnerId = dto.receiverId;
      userId = senderId;
    } else if (senderIsAdmin && receiverIsUser) {
      // Admin sending to user - admin acts as partner
      partnerId = senderId;
      userId = dto.receiverId;
    } else if (senderIsUser && receiverIsAdmin) {
      // User sending to admin - admin acts as partner
      partnerId = dto.receiverId;
      userId = senderId;
    } else {
      console.log('❌ [sendMessage] Invalid participants - cannot determine partner/user relationship');
      throw new ForbiddenException('Invalid conversation participants');
    }

    // Find or create conversation
    let conversation = await this.conversationRepository.findOne({
      where: {
        partnerId,
        userId,
        moduleType: dto.moduleType,
      },
    });

    if (!conversation) {
      conversation = this.conversationRepository.create({
        partnerId,
        userId,
        moduleType: dto.moduleType,
        lastMessageAt: new Date(),
      });
      await this.conversationRepository.save(conversation);
    } else {
      // Update last message timestamp
      conversation.lastMessageAt = new Date();
      await this.conversationRepository.save(conversation);
    }

    // Create message
    const message = this.messageRepository.create({
      conversationId: conversation.id,
      senderId,
      receiverId: dto.receiverId,
      content: dto.content,
      attachment: dto.attachment || null,
      isRead: false,
    });

    return await this.messageRepository.save(message);
  }

  /**
   * Get conversations for a partner (shows all users they can chat with)
   */
  async getConversationsForPartner(partnerId: string, moduleType: ModuleType) {
    const partner = await this.userRepository.findOne({ where: { id: partnerId } });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const moduleConfig = getModuleConfig(moduleType);

    // Verify partner has correct role for this module
    if (partner.role !== moduleConfig.partnerRole && partner.role !== 'admin') {
      throw new ForbiddenException('Not authorized for this module');
    }

    // Get all users with permission for this module (exclude partners and admins)
    const permissionField = moduleConfig.permissionField;
    const usersWithPermission = await this.userPermissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.user', 'user')
      .where(`permission.${permissionField} = :hasPermission`, { hasPermission: true })
      .andWhere('user.role = :userRole', { userRole: 'user' }) // Only get regular users
      .getMany();

    // Get existing conversations
    const conversations = await this.conversationRepository.find({
      where: {
        partnerId,
        moduleType,
      },
      relations: ['user'],
      order: {
        lastMessageAt: 'DESC',
      },
    });

    // Build response with unread counts
    const conversationsWithData = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            receiverId: partnerId,
            isRead: false,
          },
        });

        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        return {
          conversationId: conv.id,
          user: {
            id: conv.user.id,
            fullName: conv.user.full_name,
            email: conv.user.email,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
        };
      }),
    );

    // Add users without conversations yet
    const existingUserIds = new Set(conversations.map((c) => c.userId));
    const newUsers = usersWithPermission
      .filter((p) => !existingUserIds.has(p.user.id))
      .map((p) => ({
        conversationId: null,
        user: {
          id: p.user.id,
          fullName: p.user.full_name,
          email: p.user.email,
        },
        lastMessage: null,
        unreadCount: 0,
        lastMessageAt: null,
      }));

    return [...conversationsWithData, ...newUsers];
  }

  /**
   * Get conversation for a user (shows their partner for the module)
   * Admin can also use this to chat with partners as a user
   */
  async getConversationForUser(userId: string, moduleType: ModuleType) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const moduleConfig = getModuleConfig(moduleType);
    const isAdmin = user.role === 'admin';

    // For non-admin users, verify they have permission for this module
    if (!isAdmin) {
      const permission = await this.userPermissionRepository.findOne({
        where: { userId },
      });

      const permissionField = moduleConfig.permissionField;
      if (!permission || !permission[permissionField]) {
        throw new ForbiddenException('No permission for this module');
      }
    }

    // Find partner for this module (first one with the role)
    const partner = await this.userRepository.findOne({
      where: { role: moduleConfig.partnerRole },
    });

    if (!partner) {
      throw new NotFoundException('No partner available for this module');
    }

    // Find conversation for THIS specific user
    const conversation = await this.conversationRepository.findOne({
      where: {
        partnerId: partner.id,
        userId,  // This ensures we only get THIS user's conversation
        moduleType,
      },
    });

    const unreadCount = conversation
      ? await this.messageRepository.count({
          where: {
            conversationId: conversation.id,
            receiverId: userId,
            isRead: false,
          },
        })
      : 0;

    return {
      conversationId: conversation?.id || null,
      partner: {
        id: partner.id,
        fullName: partner.full_name,
        email: partner.email,
      },
      unreadCount,
    };
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is part of conversation - CRITICAL SECURITY CHECK
    if (conversation.partnerId !== userId && conversation.userId !== userId) {
      throw new ForbiddenException('Not authorized for this conversation');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      attachment: msg.attachment,
      senderId: msg.senderId,
      senderName: msg.sender.full_name,
      createdAt: msg.createdAt,
      isRead: msg.isRead,
    }));
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    message.isRead = true;
    return await this.messageRepository.save(message);
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string, moduleType: ModuleType) {
    return await this.messageRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}
