import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRemoteYeahPlatform1762902680152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'remoteyeah' to the companies_platform_enum type
        await queryRunner.query(`
            ALTER TYPE companies_platform_enum ADD VALUE IF NOT EXISTS 'remoteyeah';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL doesn't support removing enum values directly
        // You would need to recreate the enum type to remove a value
        console.log('Cannot remove enum value in PostgreSQL - manual intervention required');
    }

}
