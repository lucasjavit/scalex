import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleToUsers1730127000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tipo ENUM para roles
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'partner');
    `);

    // Adicionar coluna role na tabela users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'user_role_enum',
        default: "'user'",
        comment: 'User role: user (default), admin, or partner',
      }),
    );

    // Criar índice para consultas por role
    await queryRunner.query(`
      CREATE INDEX idx_users_role ON users(role);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role;`);

    // Remover coluna
    await queryRunner.dropColumn('users', 'role');

    // Remover tipo ENUM
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
  }
}
