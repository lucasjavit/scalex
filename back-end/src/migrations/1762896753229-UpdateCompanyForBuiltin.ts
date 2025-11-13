import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCompanyForBuiltin1762896753229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as platforms and metadata were added in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ UpdateCompanyForBuiltin migration - platform and metadata already added in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as platforms and metadata were added in CreateRemoteJobsTables
        console.log('✅ UpdateCompanyForBuiltin revert - no action needed');
    }

}
