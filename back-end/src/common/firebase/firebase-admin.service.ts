import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App | null;

  constructor(
    @InjectPinoLogger(FirebaseAdminService.name)
    private readonly logger: PinoLogger,
  ) {
    // Inicializar Firebase Admin com credenciais
    // IMPORTANTE: As credenciais devem vir de variáveis de ambiente ou arquivo JSON

    try {
      // Log de debug das variáveis de ambiente
      this.logger.debug('🔍 Verificando variáveis de ambiente do Firebase...');
      this.logger.debug({
        projectId: process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Não configurado',
        projectIdValue: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Não configurado',
        clientEmailValue: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? `✅ Configurado (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '❌ Não configurado',
      });

      // Opção 1: Usar variáveis de ambiente (RECOMENDADO para produção)
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY &&
        !process.env.FIREBASE_PROJECT_ID.includes('your-project-id')
      ) {
        this.logger.info('🔧 Inicializando Firebase Admin com variáveis de ambiente...');

        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        this.logger.debug(`Private key primeiros 50 chars: ${privateKey.substring(0, 50)}...`);

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        this.logger.info('✅ Firebase Admin inicializado com sucesso!');
      }
      // Opção 2: Usar arquivo de credenciais (desenvolvimento)
      else {
        this.logger.warn('⚠️  Variáveis de ambiente do Firebase não encontradas, tentando serviceAccountKey.json...');
        try {
          const serviceAccount = require('../../config/serviceAccountKey.json');
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.logger.info('✅ Firebase Admin inicializado com serviceAccountKey.json');
        } catch (error) {
          this.logger.error('⚠️  Firebase Admin não configurado. Configure as credenciais em .env ou serviceAccountKey.json');
          this.logger.error('⚠️  O servidor continuará rodando mas a autenticação não funcionará!');
          // Não inicializar o Firebase - deixar como undefined
          // Isso impedirá que o servidor quebre
          this.firebaseApp = null;
        }
      }
    } catch (error) {
      this.logger.error({
        message: '❌ Erro ao inicializar Firebase Admin',
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
      });
      this.firebaseApp = null;
    }
  }

  getAuth(): admin.auth.Auth {
    if (!this.firebaseApp) {
      throw new Error(
        'Firebase Admin SDK is not initialized. Please configure Firebase credentials.',
      );
    }
    return this.firebaseApp.auth();
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.firebaseApp) {
      throw new Error(
        'Firebase Admin SDK is not initialized. Please configure Firebase credentials.',
      );
    }
    try {
      return await this.firebaseApp.auth().verifyIdToken(idToken);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    if (!this.firebaseApp) {
      throw new Error(
        'Firebase Admin SDK is not initialized. Please configure Firebase credentials.',
      );
    }
    try {
      return await this.firebaseApp.auth().getUser(uid);
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    if (!this.firebaseApp) {
      throw new Error(
        'Firebase Admin SDK is not initialized. Please configure Firebase credentials.',
      );
    }
    try {
      return await this.firebaseApp.auth().getUserByEmail(email);
    } catch (error) {
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }
  }
}
