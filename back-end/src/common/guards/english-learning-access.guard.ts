import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard para controlar acesso ao módulo English Learning
 * Permite: user + admin + partner_english_course
 */
@Injectable()
export class EnglishLearningAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    // Admin tem acesso total
    if (userRole === 'admin') {
      return true;
    }

    // Partner do módulo de inglês tem acesso
    if (userRole === 'partner_english_course') {
      return true;
    }

    // Usuário comum também tem acesso
    if (userRole === 'user') {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. Only authenticated users can access this resource.',
    );
  }
}
