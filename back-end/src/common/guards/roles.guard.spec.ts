import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../types/user-roles.type';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (
    user: any,
    requiredRoles?: UserRole[],
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    describe('when no roles are required', () => {
      it('should allow access (return true)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
        const context = createMockExecutionContext({ role: 'user' });

        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('when user is not authenticated', () => {
      it('should deny access when no user in request', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext(undefined);

        expect(guard.canActivate(context)).toBe(false);
      });

      it('should deny access when user is null', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext(null);

        expect(guard.canActivate(context)).toBe(false);
      });
    });

    describe('Admin bypass', () => {
      it('should allow admin to access any route requiring user role', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user']);
        const context = createMockExecutionContext({ role: 'admin' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow admin to access any route requiring partner role', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext({ role: 'admin' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow admin to access route requiring multiple partner roles', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([
            'partner_english_course',
            'partner_cnpj',
            'partner_remittance',
          ]);
        const context = createMockExecutionContext({ role: 'admin' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow admin to access route requiring any role', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['user', 'partner_community', 'admin']);
        const context = createMockExecutionContext({ role: 'admin' });

        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('User role access', () => {
      it('should allow user with exact matching role', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user']);
        const context = createMockExecutionContext({ role: 'user' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should deny user accessing partner-only route', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext({ role: 'user' });

        expect(guard.canActivate(context)).toBe(false);
      });

      it('should allow user when they have one of multiple allowed roles', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['user', 'partner_english_course']);
        const context = createMockExecutionContext({ role: 'user' });

        expect(guard.canActivate(context)).toBe(true);
      });
    });

    describe('Partner role access', () => {
      it('should allow partner_english_course to access their module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext({
          role: 'partner_english_course',
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should deny partner_english_course accessing different partner module', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_cnpj']);
        const context = createMockExecutionContext({
          role: 'partner_english_course',
        });

        expect(guard.canActivate(context)).toBe(false);
      });

      it('should allow partner when they have one of multiple allowed roles', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_cnpj', 'partner_remittance']);
        const context = createMockExecutionContext({ role: 'partner_cnpj' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should test all 8 partner roles individually', () => {
        const partnerRoles: UserRole[] = [
          'partner_english_course',
          'partner_cnpj',
          'partner_remittance',
          'partner_resume',
          'partner_interview',
          'partner_networking',
          'partner_job_marketplace',
          'partner_community',
        ];

        partnerRoles.forEach((role) => {
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([role]);
          const context = createMockExecutionContext({ role });

          expect(guard.canActivate(context)).toBe(true);
        });
      });
    });

    describe('Multiple roles scenarios', () => {
      it('should allow access when user has one of three required roles', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue([
            'partner_english_course',
            'partner_cnpj',
            'user',
          ]);
        const context = createMockExecutionContext({ role: 'user' });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should deny access when user has none of the required roles', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_cnpj', 'partner_remittance']);
        const context = createMockExecutionContext({
          role: 'partner_english_course',
        });

        expect(guard.canActivate(context)).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty required roles array (deny access)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
        const context = createMockExecutionContext({ role: 'user' });

        // Array vazio significa que nenhuma role é permitida, então deve negar acesso
        expect(guard.canActivate(context)).toBe(false);
      });

      it('should handle user with no role property', () => {
        jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['partner_english_course']);
        const context = createMockExecutionContext({});

        expect(guard.canActivate(context)).toBe(false);
      });

      it('should properly call reflector with correct parameters', () => {
        const spy = jest
          .spyOn(reflector, 'getAllAndOverride')
          .mockReturnValue(['user']);
        const context = createMockExecutionContext({ role: 'user' });

        guard.canActivate(context);

        expect(spy).toHaveBeenCalledWith('roles', [
          context.getHandler(),
          context.getClass(),
        ]);
      });
    });
  });
});
