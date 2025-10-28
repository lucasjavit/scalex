import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard para permitir acesso APENAS para admin
 * Usado em rotas de gerenciamento de usuários e roles
 */
@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Apenas admin tem acesso
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Access denied. Only admins can access this resource.',
      );
    }

    return true;
  }
}
