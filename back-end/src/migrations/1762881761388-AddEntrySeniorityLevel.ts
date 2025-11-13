import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntrySeniorityLevel1762881761388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as 'entry' seniority was added in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ AddEntrySeniorityLevel migration - seniority already added in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as 'entry' seniority was added in CreateRemoteJobsTables
        console.log('✅ AddEntrySeniorityLevel revert - no action needed');
    }

}
