import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCompanyForBuiltin1762896753229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add 'builtin' to the platform enum
        await queryRunner.query(`
            ALTER TYPE companies_platform_enum ADD VALUE IF NOT EXISTS 'builtin';
        `);

        // 2. Add metadata column (jsonb) to companies table
        await queryRunner.query(`
            ALTER TABLE companies
            ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove metadata column
        await queryRunner.query(`
            ALTER TABLE companies
            DROP COLUMN IF EXISTS metadata;
        `);

        // Note: PostgreSQL doesn't support removing enum values directly
        // You would need to recreate the enum type to remove 'builtin'
        // For simplicity, we'll leave it in the down migration
    }

}
