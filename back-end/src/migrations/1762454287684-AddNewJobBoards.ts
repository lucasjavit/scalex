import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewJobBoards1762454287684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Job boards now added in CreateJobBoardsTable migration
    // Keeping this empty for migration history consistency
    console.log('✅ AddNewJobBoards migration - job boards now added in CreateJobBoardsTable');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Job boards now added in CreateJobBoardsTable migration
    console.log('✅ AddNewJobBoards revert - no action needed');
  }
}
