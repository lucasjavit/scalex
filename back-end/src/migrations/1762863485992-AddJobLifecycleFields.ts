import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobLifecycleFields1762863485992 implements MigrationInterface {
    name = 'AddJobLifecycleFields1762863485992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as the fields were added directly in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ AddJobLifecycleFields migration - fields already added in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as the fields were added directly in CreateRemoteJobsTables
        console.log('✅ AddJobLifecycleFields revert - no action needed');
    }

}
