import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRemoteYeahPlatform1762902680152 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as remoteyeah platform was added in CreateRemoteJobsTables
        // Keeping it for migration history consistency
        console.log('✅ AddRemoteYeahPlatform migration - platform already added in CreateRemoteJobsTables');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration is now empty as remoteyeah platform was added in CreateRemoteJobsTables
        console.log('✅ AddRemoteYeahPlatform revert - no action needed');
    }

}
