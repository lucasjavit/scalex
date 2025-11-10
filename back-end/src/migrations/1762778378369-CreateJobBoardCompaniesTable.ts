import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobBoardCompaniesTable1762778378369
  implements MigrationInterface
{
  name = 'CreateJobBoardCompaniesTable1762778378369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "job_board_companies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "job_board_id" uuid NOT NULL,
        "company_id" uuid NOT NULL,
        "scraper_url" varchar NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "last_scraped_at" TIMESTAMP,
        "scraping_status" varchar,
        "error_message" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_board_companies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_job_board_company" UNIQUE ("job_board_id", "company_id"),
        CONSTRAINT "FK_job_board_companies_job_board" FOREIGN KEY ("job_board_id") REFERENCES "job_boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_job_board_companies_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_job_board_companies_job_board_company" ON "job_board_companies" ("job_board_id", "company_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_job_board_companies_job_board_company"`,
    );
    await queryRunner.query(`DROP TABLE "job_board_companies"`);
  }
}
