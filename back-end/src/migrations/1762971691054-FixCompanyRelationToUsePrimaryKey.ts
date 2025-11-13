import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCompanyRelationToUsePrimaryKey1762971691054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add new companyId column (UUID, nullable)
        await queryRunner.query(`
            ALTER TABLE "jobs"
            ADD COLUMN "companyId" UUID NULL
        `);

        // 2. Populate companyId from companySlug using companies table
        await queryRunner.query(`
            UPDATE "jobs"
            SET "companyId" = "companies"."id"
            FROM "companies"
            WHERE "jobs"."companySlug" = "companies"."slug"
        `);

        // 3. Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "jobs"
            ADD CONSTRAINT "FK_jobs_company"
            FOREIGN KEY ("companyId")
            REFERENCES "companies"("id")
            ON DELETE SET NULL
        `);

        // 4. Create index on companyId for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_companyId" ON "jobs" ("companyId")
        `);

        // Note: We keep companySlug for backward compatibility
        // It will be removed in a future migration after verification
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_jobs_companyId"`);

        // Drop foreign key
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_company"`);

        // Drop column
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "companyId"`);
    }

}
