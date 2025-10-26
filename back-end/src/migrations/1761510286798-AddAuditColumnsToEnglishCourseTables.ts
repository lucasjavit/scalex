import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditColumnsToEnglishCourseTables1761510286798 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add audit columns to stages table
        await queryRunner.query(`
            ALTER TABLE stages
            ADD COLUMN created_by UUID,
            ADD COLUMN updated_by UUID,
            ADD COLUMN deleted_at TIMESTAMP,
            ADD COLUMN deleted_by UUID;
        `);

        // Add audit columns to units table
        await queryRunner.query(`
            ALTER TABLE units
            ADD COLUMN created_by UUID,
            ADD COLUMN updated_by UUID,
            ADD COLUMN deleted_at TIMESTAMP,
            ADD COLUMN deleted_by UUID;
        `);

        // Add audit columns to cards table
        await queryRunner.query(`
            ALTER TABLE cards
            ADD COLUMN created_by UUID,
            ADD COLUMN updated_by UUID,
            ADD COLUMN deleted_at TIMESTAMP,
            ADD COLUMN deleted_by UUID;
        `);

        // Create indexes for soft delete queries
        await queryRunner.query(`
            CREATE INDEX idx_stages_deleted_at ON stages(deleted_at);
            CREATE INDEX idx_units_deleted_at ON units(deleted_at);
            CREATE INDEX idx_cards_deleted_at ON cards(deleted_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_stages_deleted_at;
            DROP INDEX IF EXISTS idx_units_deleted_at;
            DROP INDEX IF EXISTS idx_cards_deleted_at;
        `);

        // Remove audit columns from cards table
        await queryRunner.query(`
            ALTER TABLE cards
            DROP COLUMN IF EXISTS created_by,
            DROP COLUMN IF EXISTS updated_by,
            DROP COLUMN IF EXISTS deleted_at,
            DROP COLUMN IF EXISTS deleted_by;
        `);

        // Remove audit columns from units table
        await queryRunner.query(`
            ALTER TABLE units
            DROP COLUMN IF EXISTS created_by,
            DROP COLUMN IF EXISTS updated_by,
            DROP COLUMN IF EXISTS deleted_at,
            DROP COLUMN IF EXISTS deleted_by;
        `);

        // Remove audit columns from stages table
        await queryRunner.query(`
            ALTER TABLE stages
            DROP COLUMN IF EXISTS created_by,
            DROP COLUMN IF EXISTS updated_by,
            DROP COLUMN IF EXISTS deleted_at,
            DROP COLUMN IF EXISTS deleted_by;
        `);
    }

}
