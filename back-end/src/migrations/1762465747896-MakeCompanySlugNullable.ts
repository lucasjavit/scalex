import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCompanySlugNullable1762465747896 implements MigrationInterface {
    name = 'MakeCompanySlugNullable1762465747896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as companySlug was created nullable in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ MakeCompanySlugNullable migration - field already nullable in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as companySlug was created nullable in CreateRemoteJobsTables
        console.log('✅ MakeCompanySlugNullable revert - no action needed');
    }

}
