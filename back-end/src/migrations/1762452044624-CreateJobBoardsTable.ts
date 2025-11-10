import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobBoardsTable1762452044624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela job_boards
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
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Inserir os 26 job boards
    await queryRunner.query(`
      INSERT INTO "job_boards" ("slug", "name", "url", "scraper", "enabled", "priority", "description") VALUES
      ('wellfound', 'Wellfound (AngelList)', 'https://wellfound.com/remote', 'wellfound', true, 1, 'Startup jobs from AngelList/Wellfound'),
      ('workatastartup', 'Y Combinator Work at a Startup', 'https://www.workatastartup.com/jobs', 'workatastartup', true, 1, 'Jobs from Y Combinator startups'),
      ('builtin', 'Built In', 'https://builtin.com/jobs/remote', 'builtin', true, 1, 'Tech jobs from Built In'),
      ('remoterocketship', 'Remote Rocketship', 'https://www.remoterocketship.com', 'remoterocketship', true, 2, 'Remote job board'),
      ('lever', 'Lever Jobs', 'https://jobs.lever.co', 'lever', true, 2, 'ATS platform - company job boards'),
      ('greenhouse', 'Greenhouse', 'https://boards.greenhouse.io', 'greenhouse', false, 2, 'ATS platform - company job boards'),
      ('pinpointhq', 'Pinpoint', 'https://pinpointhq.com', 'generic', false, 3, 'Recruitment platform'),
      ('breezy', 'Breezy HR', 'https://breezy.hr', 'generic', false, 3, 'HR and recruitment software'),
      ('recruitee', 'Recruitee', 'https://recruitee.com', 'generic', false, 3, 'Collaborative hiring software'),
      ('teamtailor', 'Teamtailor', 'https://teamtailor.com', 'generic', false, 3, 'Recruitment software'),
      ('smartrecruiters', 'SmartRecruiters', 'https://smartrecruiters.com', 'generic', false, 3, 'Talent acquisition platform'),
      ('homerun', 'Homerun', 'https://homerun.co', 'generic', false, 3, 'Hiring tool'),
      ('jobvite', 'Jobvite', 'https://jobvite.com', 'generic', false, 3, 'Recruitment software'),
      ('icims', 'iCIMS', 'https://icims.com', 'generic', false, 3, 'Talent acquisition platform'),
      ('rippling', 'Rippling', 'https://rippling.com', 'generic', false, 4, 'HR and payroll platform'),
      ('gusto', 'Gusto', 'https://gusto.com', 'generic', false, 4, 'Payroll and benefits platform'),
      ('adp', 'ADP', 'https://www.adp.com', 'generic', false, 4, 'HR and payroll services'),
      ('glassdoor', 'Glassdoor', 'https://www.glassdoor.com', 'generic', false, 5, 'Job search and company reviews'),
      ('notion', 'Notion Jobs', 'https://notion.site', 'generic', false, 5, 'Jobs hosted on Notion'),
      ('dover', 'Dover', 'https://dover.io', 'generic', false, 5, 'Recruiting platform'),
      ('gem', 'Gem', 'https://gem.com', 'generic', false, 5, 'Recruiting platform'),
      ('trakstar', 'Trakstar', 'https://trakstar.com', 'generic', false, 5, 'Performance management software'),
      ('catsone', 'CatsOne', 'https://catsone.com', 'generic', false, 5, 'Applicant tracking system'),
      ('applytojob', 'ApplyToJob', 'https://applytojob.com', 'generic', false, 5, 'Job application platform'),
      ('careerpuck', 'CareerPuck', 'https://careerpuck.com', 'generic', false, 5, 'Career site platform'),
      ('keka', 'Keka', 'https://keka.com', 'generic', false, 5, 'HR and payroll software')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "job_boards"`);
  }
}
