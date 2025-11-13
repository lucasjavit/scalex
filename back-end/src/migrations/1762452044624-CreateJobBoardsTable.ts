import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobBoardsTable1762452044624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create job_boards table
    await queryRunner.query(`
      CREATE TABLE "job_boards" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "slug" varchar NOT NULL UNIQUE,
        "name" varchar NOT NULL,
        "url" varchar NOT NULL,
        "scraper" varchar NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "priority" integer NOT NULL DEFAULT 3,
        "description" text,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert job board aggregators and independent job boards
    await queryRunner.query(`
      INSERT INTO "job_boards" ("slug", "name", "url", "scraper", "enabled", "priority", "description") VALUES
      -- ATS Aggregators (Multi-company platforms)
      ('lever', 'Lever', 'https://jobs.lever.co', 'lever', true, 1, 'Lever ATS - Multi-company job board aggregator'),
      ('greenhouse', 'Greenhouse', 'https://boards.greenhouse.io', 'greenhouse', true, 1, 'Greenhouse ATS - Multi-company job board aggregator'),

      -- Independent Job Boards
      ('builtin', 'Built In', 'https://builtin.com/jobs/remote', 'builtin', true, 1, 'Tech jobs from Built In'),
      ('remoteyeah', 'Remote Yeah', 'https://remoteyeah.com', 'remoteyeah', true, 2, 'Remote job board'),
      ('weworkremotely', 'We Work Remotely', 'https://weworkremotely.com', 'weworkremotely', true, 2, 'Remote job board'),
      ('remotive', 'Remotive', 'https://remotive.com', 'remotive', true, 2, 'Remote job board'),
      ('wellfound', 'Wellfound', 'https://wellfound.com/remote', 'wellfound', false, 3, 'Startup jobs from AngelList/Wellfound'),
      ('workatastartup', 'Y Combinator', 'https://www.workatastartup.com/jobs', 'workatastartup', false, 3, 'Jobs from Y Combinator startups')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "job_boards"`);
  }
}
