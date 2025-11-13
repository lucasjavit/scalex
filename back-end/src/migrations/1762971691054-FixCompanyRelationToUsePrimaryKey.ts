import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCompanyRelationToUsePrimaryKey1762971691054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as companyId was added in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ FixCompanyRelationToUsePrimaryKey migration - companyId already added in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as companyId was added in CreateRemoteJobsTables
        console.log('✅ FixCompanyRelationToUsePrimaryKey revert - no action needed');
    }

}
