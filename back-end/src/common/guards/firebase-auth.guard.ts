import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private firebaseAdminService: FirebaseAdminService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Extrair token do header Authorization
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Verificar token com Firebase Admin
      const decodedToken = await this.firebaseAdminService.verifyIdToken(token);

      // Buscar usuário por Firebase UID ou email (para primeiro login do admin)
      const firebaseUser = await this.firebaseAdminService.getUserByUid(
        decodedToken.uid,
      );
      const email = firebaseUser.email || `${firebaseUser.uid}@firebase.user`;

      // Tentar encontrar por UID ou vincular email com pending-first-login
      let user = await this.usersService.findByFirebaseUidOrEmail(
        decodedToken.uid,
        email,
      );

      if (!user) {
        // Se usuário não existe, criar novo
        user = await this.usersService.create({
          firebase_uid: firebaseUser.uid,
          email: email,
          full_name: firebaseUser.displayName || email.split('@')[0],
          // Campos opcionais - você pode pedir ao usuário completar depois
          birth_date: '2000-01-01', // Placeholder - formato string ISO
          phone: firebaseUser.phoneNumber || 'N/A',
          preferred_language: 'pt-BR',
        });
      }

      // Injetar usuário completo no request
      request.user = {
        id: user.id, // Para compatibilidade com @CurrentUser('id')
        userId: user.id,
        firebaseUid: user.firebase_uid,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      };

      return true;
    } catch (error) {
      console.error('Firebase Auth Error:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
