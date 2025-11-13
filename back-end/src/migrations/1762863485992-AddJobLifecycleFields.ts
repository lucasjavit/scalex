import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobLifecycleFields1762863485992 implements MigrationInterface {
    name = 'AddJobLifecycleFields1762863485992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the actual index that was created by CreateJobBoardCompaniesTable migration
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_job_board_companies_job_board_company"`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "firstSeenAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`COMMENT ON COLUMN "job_board_companies"."scraper_url" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "job_board_companies"."scraping_status" IS NULL`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_0c88f6b797898401b77526a525" ON "job_board_companies" ("job_board_id", "company_id") `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_0438611f1bd3705dc884cfcc06" ON "jobs" ("isActive") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0438611f1bd3705dc884cfcc06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c88f6b797898401b77526a525"`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`COMMENT ON COLUMN "job_board_companies"."scraping_status" IS 'Status do último scraping: success, error, pending'`);
        await queryRunner.query(`COMMENT ON COLUMN "job_board_companies"."scraper_url" IS 'URL específica para scraping dessa empresa nesse job board'`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "lastSeenAt"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "firstSeenAt"`);
        // Recreate the original index that was dropped in the up() method
        await queryRunner.query(`CREATE INDEX "IDX_job_board_companies_job_board_company" ON "job_board_companies" ("job_board_id", "company_id") `);
    }

}
