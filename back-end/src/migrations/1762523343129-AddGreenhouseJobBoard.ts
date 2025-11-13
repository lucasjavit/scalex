import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGreenhouseJobBoard1762523343129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Greenhouse job board now added in CreateJobBoardsTable migration
    // Keeping this empty for migration history consistency
    console.log('✅ AddGreenhouseJobBoard migration - job board now added in CreateJobBoardsTable');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Greenhouse job board now added in CreateJobBoardsTable migration
    console.log('✅ AddGreenhouseJobBoard revert - no action needed');
  }
}
