import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private firebaseApp: admin.app.App | null;

  constructor() {
    // Inicializar Firebase Admin com credenciais
    // IMPORTANTE: As credenciais devem vir de variáveis de ambiente ou arquivo JSON

    try {
      // Opção 1: Usar variáveis de ambiente (RECOMENDADO para produção)
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY &&
        !process.env.FIREBASE_PROJECT_ID.includes('your-project-id')
      ) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
        console.log('✅ Firebase Admin inicializado com variáveis de ambiente');
      }
      // Opção 2: Usar arquivo de credenciais (desenvolvimento)
      else {
        try {
          const serviceAccount = require('../../config/serviceAccountKey.json');
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log(
            '✅ Firebase Admin inicializado com serviceAccountKey.json',
          );
        } catch (error) {
          console.warn(
            '⚠️  Firebase Admin não configurado. Configure as credenciais em .env ou serviceAccountKey.json',
          );
          console.warn(
            '⚠️  O servidor continuará rodando mas a autenticação não funcionará!',
          );
          // Não inicializar o Firebase - deixar como undefined
          // Isso impedirá que o servidor quebre
          this.firebaseApp = null;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
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
