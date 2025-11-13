import { MigrationInterface, QueryRunner } from "typeorm";

export class DisableFailingCompaniesAndAddAggregators1762518215166 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration tried to disable companies that were incorrectly added to job_boards
        // Now handled by proper structure in FixJobBoardsVsCompanies
        // Keeping this empty for migration history consistency
        console.log('✅ DisableFailingCompaniesAndAddAggregators migration - no longer needed');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration tried to disable companies that were incorrectly added to job_boards
        console.log('✅ DisableFailingCompaniesAndAddAggregators revert - no action needed');
    }

}
