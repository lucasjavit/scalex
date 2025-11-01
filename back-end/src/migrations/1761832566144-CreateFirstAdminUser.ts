import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create First Admin User
 *
 * Esta migration garante que o email vyeiralucas@gmail.com seja registrado
 * como admin assim que fizer o primeiro login via Firebase.
 *
 * SEGURANÇA:
 * - Não cria senha no banco (usa Firebase Authentication)
 * - Apenas marca o email como admin
 * - Usuário precisa autenticar via Firebase primeiro
 * - firebase_uid será preenchido automaticamente no primeiro login
 */
export class CreateFirstAdminUser1761832566144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se já existe algum admin
    const adminExists = await queryRunner.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'admin'`,
    );

    if (adminExists[0].count > 0) {
      console.log('⚠️  Admin já existe. Pulando criação do primeiro admin.');
      return;
    }

    console.log('🔐 Criando configuração para primeiro admin...');

    // Insere o email do admin (firebase_uid será preenchido no primeiro login)
    await queryRunner.query(`
      INSERT INTO users (
        email,
        role,
        full_name,
        birth_date,
        phone,
        preferred_language,
        is_active,
        firebase_uid,
        created_at,
        updated_at
      ) VALUES (
        'vyeiralucas@gmail.com',
        'admin',
        'Lucas Aguiar',
        '2000-01-01',
        '+55 00 00000-0000',
        'pt-BR',
        true,
        'pending-first-login',
        NOW(),
        NOW()
      )
      ON CONFLICT (email)
      DO UPDATE SET
        role = 'admin',
        updated_at = NOW()
    `);

    console.log('✅ Email vyeiralucas@gmail.com configurado como admin');
    console.log(
      '📧 O usuário será criado/atualizado no primeiro login via Firebase',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove apenas se o firebase_uid ainda estiver como 'pending-first-login'
    await queryRunner.query(`
      DELETE FROM users
      WHERE email = 'vyeiralucas@gmail.com'
      AND firebase_uid = 'pending-first-login'
    `);
    console.log('🔄 Reversão: Configuração do primeiro admin removida');
  }
}
