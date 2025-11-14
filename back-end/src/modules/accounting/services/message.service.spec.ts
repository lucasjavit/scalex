import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { AccountingMessage } from '../entities/accounting-message.entity';
import { CompanyRegistrationRequest } from '../entities/company-registration-request.entity';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: Repository<AccountingMessage>;
  let requestRepository: Repository<CompanyRegistrationRequest>;

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRequestRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(AccountingMessage),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(CompanyRegistrationRequest),
          useValue: mockRequestRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<Repository<AccountingMessage>>(
      getRepositoryToken(AccountingMessage),
    );
    requestRepository = module.get<Repository<CompanyRegistrationRequest>>(
      getRepositoryToken(CompanyRegistrationRequest),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    const sendDto = {
      requestId: 'request-123',
      companyId: null,
      receiverId: 'user-456',
      message: 'Hello, I need help with my documents',
      attachment: null,
    };

    it('should send a message successfully', async () => {
      const mockRequest = {
        id: 'request-123',
        userId: 'user-789',
        assignedToId: 'user-456',
      };

      const mockMessage = {
        id: 'message-123',
        requestId: 'request-123',
        senderId: 'user-789',
        receiverId: 'user-456',
        message: 'Hello, I need help with my documents',
        isRead: false,
        createdAt: new Date(),
      };

      mockRequestRepository.findOne.mockResolvedValue(mockRequest);
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      const result = await service.sendMessage('user-789', sendDto);

      expect(requestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'request-123' },
      });
      expect(messageRepository.create).toHaveBeenCalledWith({
        requestId: 'request-123',
        companyId: null,
        senderId: 'user-789',
        receiverId: 'user-456',
        message: 'Hello, I need help with my documents',
        attachmentPath: null,
      });
      expect(messageRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should throw BadRequestException when both requestId and companyId are null', async () => {
      const invalidDto = {
        requestId: null,
        companyId: null,
        receiverId: 'user-456',
        message: 'Test',
        attachment: null,
      };

      await expect(service.sendMessage('user-789', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when both requestId and companyId are provided', async () => {
      const invalidDto = {
        requestId: 'request-123',
        companyId: 'company-123',
        receiverId: 'user-456',
        message: 'Test',
        attachment: null,
      };

      await expect(service.sendMessage('user-789', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when request not found', async () => {
      mockRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.sendMessage('user-789', sendDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMessagesByRequest', () => {
    it('should return messages for a request ordered by createdAt', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          requestId: 'request-123',
          senderId: 'user-1',
          message: 'First message',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'msg-2',
          requestId: 'request-123',
          senderId: 'user-2',
          message: 'Second message',
          createdAt: new Date('2025-01-02'),
        },
      ];

      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.getMessagesByRequest('request-123');

      expect(messageRepository.find).toHaveBeenCalledWith({
        where: { requestId: 'request-123' },
        relations: ['sender', 'receiver'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getMessagesByCompany', () => {
    it('should return messages for a company ordered by createdAt', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          companyId: 'company-123',
          senderId: 'user-1',
          message: 'Company message',
          createdAt: new Date('2025-01-01'),
        },
      ];

      mockMessageRepository.find.mockResolvedValue(mockMessages);

      const result = await service.getMessagesByCompany('company-123');

      expect(messageRepository.find).toHaveBeenCalledWith({
        where: { companyId: 'company-123' },
        relations: ['sender', 'receiver'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read successfully', async () => {
      const mockMessage = {
        id: 'message-123',
        receiverId: 'user-456',
        isRead: false,
        readAt: null,
      };

      const updatedMessage = {
        ...mockMessage,
        isRead: true,
        readAt: new Date(),
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(updatedMessage);

      const result = await service.markAsRead('message-123', 'user-456');

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'message-123' },
      });
      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
    });

    it('should throw NotFoundException when message not found', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markAsRead('message-123', 'user-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not the receiver', async () => {
      const mockMessage = {
        id: 'message-123',
        receiverId: 'user-999',
        isRead: false,
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);

      await expect(
        service.markAsRead('message-123', 'user-456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread messages for a user', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUnreadCount('user-456');

      expect(messageRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'receiverId = :userId',
        { userId: 'user-456' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'isRead = :isRead',
        { isRead: false },
      );
      expect(result).toBe(5);
    });

    it('should return 0 when user has no unread messages', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUnreadCount('user-456');

      expect(result).toBe(0);
    });
  });
});
