import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewJobBoards1762454287684 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar os 4 novos job boards
    await queryRunner.query(`
      INSERT INTO "job_boards" ("slug", "name", "url", "scraper", "enabled", "priority", "description") VALUES
      ('leverjobs', 'Lever Jobs', 'https://jobs.lever.co', 'generic', true, 2, 'Lever ATS - aggregated job listings'),
      ('workable', 'Workable', 'https://jobs.workable.com', 'generic', true, 2, 'Workable ATS - aggregated job listings'),
      ('remoteyeah', 'Remote Yeah', 'https://remoteyeah.com', 'generic', true, 2, 'Remote job board'),
      ('ashbyhq', 'Ashby HQ', 'https://jobs.ashbyhq.com', 'generic', true, 2, 'Ashby ATS - aggregated job listings')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover os job boards adicionados
    await queryRunner.query(`
      DELETE FROM "job_boards"
      WHERE slug IN ('leverjobs', 'workable', 'remoteyeah', 'ashbyhq')
    `);
  }
}
