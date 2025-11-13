import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let reflector: Reflector;
  let firebaseAdminService: jest.Mocked<FirebaseAdminService>;
  let usersService: jest.Mocked<UsersService>;
  let logger: any;

  beforeEach(() => {
    reflector = new Reflector();
    firebaseAdminService = {
      verifyIdToken: jest.fn(),
      getUserByUid: jest.fn(),
    } as any;
    usersService = {
      findByFirebaseUid: jest.fn(),
      create: jest.fn(),
    } as any;
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      setContext: jest.fn(),
    } as any;

    guard = new FirebaseAuthGuard(
      reflector,
      firebaseAdminService,
      usersService,
      logger,
    );
  });

  const createMockExecutionContext = (
    authHeader?: string,
    isPublic: boolean = false,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
      user: undefined,
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  const createMockUser = (role = 'user'): User => ({
    id: 'user-id-123',
    firebase_uid: 'firebase-uid-123',
    email: 'test@example.com',
    full_name: 'Test User',
    birth_date: new Date('1990-01-01'),
    phone: '+5511999999999',
    preferred_language: 'pt-BR',
    is_active: true,
    role: role as any,
    addresses: [],
    created_at: new Date(),
    updated_at: new Date(),
  });

  describe('Public routes', () => {
    it('should allow access to public routes without token', async () => {
      const context = createMockExecutionContext(undefined, true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(firebaseAdminService.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should allow access to public routes with invalid token', async () => {
      const context = createMockExecutionContext('Bearer invalid', true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(firebaseAdminService.verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('Token validation', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockExecutionContext(undefined, false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      const context = createMockExecutionContext('Basic invalid-token', false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No token provided',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const context = createMockExecutionContext('Bearer invalid-token', false);
      firebaseAdminService.verifyIdToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const context = createMockExecutionContext('Bearer expired-token', false);
      firebaseAdminService.verifyIdToken.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });

  describe('User synchronization - existing user', () => {
    it('should authenticate existing user with default role', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user).toEqual({
        userId: mockUser.id,
        firebaseUid: mockUser.firebase_uid,
        email: mockUser.email,
        role: 'user',
        fullName: mockUser.full_name,
      });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should authenticate existing admin user', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('admin');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user.role).toBe('admin');
    });

    it('should authenticate existing partner_english_course user', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('partner_english_course');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(result).toBe(true);
      expect(request.user.role).toBe('partner_english_course');
    });

    it('should authenticate users with all partner roles', async () => {
      const partnerRoles = [
        'partner_english_course',
        'partner_cnpj',
        'partner_remittance',
        'partner_resume',
        'partner_interview',
        'partner_networking',
        'partner_job_marketplace',
        'partner_community',
      ];

      for (const role of partnerRoles) {
        const context = createMockExecutionContext('Bearer valid-token', false);
        const mockUser = createMockUser(role);

        firebaseAdminService.verifyIdToken.mockResolvedValue({
          uid: 'firebase-uid-123',
        } as any);
        usersService.findByFirebaseUid.mockResolvedValue(mockUser);

        const result = await guard.canActivate(context);
        const request = context.switchToHttp().getRequest();

        expect(result).toBe(true);
        expect(request.user.role).toBe(role);
      }
    });
  });

  describe('User synchronization - new user creation', () => {
    it('should create new user when not found in database', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(null);
      firebaseAdminService.getUserByUid.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        phoneNumber: '+5511999999999',
      } as any);
      usersService.create.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith({
        firebase_uid: 'firebase-uid-123',
        email: 'newuser@example.com',
        full_name: 'New User',
        birth_date: '2000-01-01',
        phone: '+5511999999999',
        preferred_language: 'pt-BR',
      });
    });

    it('should handle Firebase user without email', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(null);
      firebaseAdminService.getUserByUid.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: undefined, // No email
        displayName: 'User Without Email',
        phoneNumber: null,
      } as any);
      usersService.create.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'firebase-uid-123@firebase.user',
          full_name: 'User Without Email',
          phone: 'N/A',
        }),
      );
    });

    it('should handle Firebase user without displayName', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(null);
      firebaseAdminService.getUserByUid.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        displayName: undefined, // No display name
        phoneNumber: '+5511999999999',
      } as any);
      usersService.create.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'user@example.com',
          full_name: 'user', // Extracted from email
        }),
      );
    });

    it('should handle Firebase user without phone number', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(null);
      firebaseAdminService.getUserByUid.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'user@example.com',
        displayName: 'Test User',
        phoneNumber: null, // No phone
      } as any);
      usersService.create.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: 'N/A',
        }),
      );
    });
  });

  describe('Request user injection', () => {
    it('should inject correct user data into request', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('partner_cnpj');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(request.user).toEqual({
        userId: 'user-id-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        role: 'partner_cnpj',
        fullName: 'Test User',
      });
    });

    it('should inject user with all required properties', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);
      const mockUser = createMockUser('admin');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      expect(request.user).toHaveProperty('userId');
      expect(request.user).toHaveProperty('firebaseUid');
      expect(request.user).toHaveProperty('email');
      expect(request.user).toHaveProperty('role');
      expect(request.user).toHaveProperty('fullName');
    });
  });

  describe('Edge cases', () => {
    it('should handle token with extra spaces', async () => {
      const context = createMockExecutionContext(
        'Bearer    token-with-spaces   ',
        false,
      );
      const mockUser = createMockUser('user');

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(firebaseAdminService.verifyIdToken).toHaveBeenCalledWith(
        '   token-with-spaces   ',
      );
    });

    it('should handle database errors gracefully', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);

      firebaseAdminService.verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid-123',
      } as any);
      usersService.findByFirebaseUid.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle Firebase service errors', async () => {
      const context = createMockExecutionContext('Bearer valid-token', false);

      firebaseAdminService.verifyIdToken.mockRejectedValue(
        new Error('Firebase service unavailable'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
