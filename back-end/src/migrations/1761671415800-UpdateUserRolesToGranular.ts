import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRolesToGranular1761671415800 implements MigrationInterface {
  name = 'UpdateUserRolesToGranular1761671415800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar novo tipo enum com todas as roles granulares
    await queryRunner.query(`
      CREATE TYPE user_role_enum_new AS ENUM (
        'user',
        'admin',
        'partner_english_course',
        'partner_cnpj',
        'partner_remittance',
        'partner_resume',
        'partner_interview',
        'partner_networking',
        'partner_job_marketplace',
        'partner_community'
      );
    `);

    // 2. Remover default temporariamente
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
    `);

    // 3. Migrar dados existentes: 'partner' -> 'partner_english_course' (por padrão)
    await queryRunner.query(`
      ALTER TABLE users
        ALTER COLUMN role TYPE user_role_enum_new
        USING (
          CASE
            WHEN role::text = 'partner' THEN 'partner_english_course'::user_role_enum_new
            ELSE role::text::user_role_enum_new
          END
        );
    `);

    // 4. Remover enum antigo
    await queryRunner.query(`DROP TYPE user_role_enum;`);

    // 5. Renomear novo enum para o nome original
    await queryRunner.query(`ALTER TYPE user_role_enum_new RENAME TO user_role_enum;`);

    // 6. Restaurar default com novo enum
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;
    `);

    // 7. Atualizar comentário da coluna
    await queryRunner.query(`
      COMMENT ON COLUMN users.role IS 'User role: user (default), admin, or partner_* (specific module partner)';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar enum antigo novamente
    await queryRunner.query(`
      CREATE TYPE user_role_enum_old AS ENUM ('user', 'admin', 'partner');
    `);

    // 2. Migrar dados de volta: todos 'partner_*' -> 'partner'
    await queryRunner.query(`
      ALTER TABLE users
        ALTER COLUMN role TYPE user_role_enum_old
        USING (
          CASE
            WHEN role::text LIKE 'partner_%' THEN 'partner'::user_role_enum_old
            ELSE role::text::user_role_enum_old
          END
        );
    `);

    // 3. Remover enum novo
    await queryRunner.query(`DROP TYPE user_role_enum;`);

    // 4. Renomear enum antigo de volta
    await queryRunner.query(`ALTER TYPE user_role_enum_old RENAME TO user_role_enum;`);

    // 5. Restaurar comentário original
    await queryRunner.query(`
      COMMENT ON COLUMN users.role IS 'User role: user (default), admin, or partner';
    `);
  }
}
