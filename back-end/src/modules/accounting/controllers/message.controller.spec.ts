import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../services/message.service';
import { SendMessageDto } from '../dto/send-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  const mockService = {
    sendMessage: jest.fn(),
    getMessagesByRequest: jest.fn(),
    getMessagesByCompany: jest.fn(),
    markAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(
        require('../../../common/guards/firebase-auth.guard').FirebaseAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    const sendDto: SendMessageDto = {
      requestId: 'request-123',
      companyId: undefined,
      receiverId: 'user-456',
      message: 'Hello, need help',
      attachment: undefined,
    };

    it('should send a message successfully', async () => {
      const mockMessage = {
        id: 'message-123',
        senderId: 'user-789',
        ...sendDto,
        isRead: false,
        createdAt: new Date(),
      };

      const req = { user: { id: 'user-789' } };
      mockService.sendMessage.mockResolvedValue(mockMessage);

      const result = await controller.sendMessage(req, sendDto);

      expect(service.sendMessage).toHaveBeenCalledWith('user-789', sendDto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getMessagesByRequest', () => {
    it('should return messages for a request', async () => {
      const mockMessages = [
        { id: 'msg-1', message: 'First' },
        { id: 'msg-2', message: 'Second' },
      ];

      mockService.getMessagesByRequest.mockResolvedValue(mockMessages);

      const result = await controller.getMessagesByRequest('request-123');

      expect(service.getMessagesByRequest).toHaveBeenCalledWith('request-123');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getMessagesByCompany', () => {
    it('should return messages for a company', async () => {
      const mockMessages = [{ id: 'msg-1', message: 'Company message' }];

      mockService.getMessagesByCompany.mockResolvedValue(mockMessages);

      const result = await controller.getMessagesByCompany('company-123');

      expect(service.getMessagesByCompany).toHaveBeenCalledWith('company-123');
      expect(result).toEqual(mockMessages);
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      const mockMessage = {
        id: 'message-123',
        isRead: true,
        readAt: new Date(),
      };

      const req = { user: { id: 'user-456' } };
      mockService.markAsRead.mockResolvedValue(mockMessage);

      const result = await controller.markAsRead('message-123', req);

      expect(service.markAsRead).toHaveBeenCalledWith('message-123', 'user-456');
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      const req = { user: { id: 'user-456' } };
      mockService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(req);

      expect(service.getUnreadCount).toHaveBeenCalledWith('user-456');
      expect(result).toEqual({ count: 5 });
    });
  });
});
