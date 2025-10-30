import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { canAccessAdminRoutes } from '../types/user-roles.type';

/**
 * Guard para controlar acesso às rotas de administração
 * Permite: todos os roles EXCETO 'user'
 * (admin, partner_english_course, partner_cnpj, partner_remittance, etc.)
 */
@Injectable()
export class AdminAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user can access admin routes (all roles except 'user')
    if (canAccessAdminRoutes(userRole)) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. You do not have permission to access admin routes.',
    );
  }
}
