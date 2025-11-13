import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntrySeniorityLevel1762881761388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'entry' value to the jobs_seniority_enum
        await queryRunner.query(`
            ALTER TYPE jobs_seniority_enum ADD VALUE IF NOT EXISTS 'entry';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values directly
        // You would need to recreate the enum type to remove a value
        // For this migration, we'll leave it as a no-op in down()
    }

}
