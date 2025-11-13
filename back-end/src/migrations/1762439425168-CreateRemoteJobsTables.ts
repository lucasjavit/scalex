import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRemoteJobsTables1762439425168 implements MigrationInterface {
    name = 'CreateRemoteJobsTables1762439425168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create companies table - platform as VARCHAR for admin flexibility
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying NOT NULL,
                "name" character varying NOT NULL,
                "platform" character varying NOT NULL,
                "logo" character varying,
                "website" character varying,
                "description" text,
                "size" character varying,
                "industry" character varying,
                "locations" text,
                "metadata" jsonb DEFAULT '{}',
                "featured" boolean NOT NULL DEFAULT false,
                "featuredOrder" integer NOT NULL DEFAULT '0',
                "rating" numeric(3,2) NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "totalJobs" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_b28b07d25e4324eee577de5496d" UNIQUE ("slug"),
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_b28b07d25e4324eee577de5496" ON "companies" ("slug")
        `);

        // 2. Create jobs table with enums for seniority, employment type and status
        await queryRunner.query(`
            CREATE TYPE "public"."jobs_seniority_enum" AS ENUM(
                'entry',
                'intern',
                'junior',
                'mid',
                'senior',
                'staff',
                'principal'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."jobs_employmenttype_enum" AS ENUM(
                'full-time',
                'part-time',
                'contract',
                'internship'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."jobs_status_enum" AS ENUM(
                'active',
                'expired',
                'filled'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "externalId" character varying NOT NULL,
                "platform" character varying NOT NULL,
                "company_slug" character varying,
                "company_id" uuid,
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "location" character varying NOT NULL,
                "salary" character varying,
                "remote" boolean NOT NULL DEFAULT false,
                "countries" text,
                "tags" text,
                "seniority" "public"."jobs_seniority_enum",
                "employmentType" "public"."jobs_employmenttype_enum" NOT NULL DEFAULT 'full-time',
                "requirements" text,
                "benefits" text,
                "externalUrl" character varying NOT NULL,
                "publishedAt" TIMESTAMP NOT NULL,
                "expiresAt" TIMESTAMP,
                "scrapedAt" TIMESTAMP NOT NULL,
                "firstSeenAt" TIMESTAMP,
                "lastSeenAt" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT true,
                "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'active',
                "applicantCount" integer NOT NULL DEFAULT '0',
                "hash" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d80625b608f1ade14bf4952d13e" UNIQUE ("hash"),
                CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_a0c30e3eb9649fe7fbcd336a63" ON "jobs" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_9b479c0773df215563963543bc" ON "jobs" ("publishedAt")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_12751da8bbd60b192e07e0b702" ON "jobs" ("company_slug")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_company_id" ON "jobs" ("company_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_0438611f1bd3705dc884cfcc06" ON "jobs" ("isActive")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_07b083837ee3154d890b7a9bd1" ON "jobs" ("externalId", "platform")
        `);

        // 3. Create saved_jobs table
        await queryRunner.query(`
            CREATE TYPE "public"."saved_jobs_status_enum" AS ENUM(
                'saved',
                'applied',
                'interviewing',
                'rejected',
                'accepted'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "saved_jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "job_id" uuid NOT NULL,
                "status" "public"."saved_jobs_status_enum" NOT NULL DEFAULT 'saved',
                "notes" text,
                "appliedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1e106c66fc89f96addc57f71fb0" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_dffd10892595a06f76e6473556" ON "saved_jobs" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_07d13bb446cd7fc577209d6526" ON "saved_jobs" ("user_id")
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_967c8518b354a1d8173eec4080" ON "saved_jobs" ("user_id", "job_id")
        `);

        // 4. Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "jobs"
            ADD CONSTRAINT "FK_12751da8bbd60b192e07e0b7021"
            FOREIGN KEY ("company_slug")
            REFERENCES "companies"("slug")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "jobs"
            ADD CONSTRAINT "FK_jobs_company"
            FOREIGN KEY ("company_id")
            REFERENCES "companies"("id")
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "saved_jobs"
            ADD CONSTRAINT "FK_07d13bb446cd7fc577209d65265"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "saved_jobs"
            ADD CONSTRAINT "FK_d881f4ad49b0839b3f14b67e6d7"
            FOREIGN KEY ("job_id")
            REFERENCES "jobs"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_d881f4ad49b0839b3f14b67e6d7"`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_07d13bb446cd7fc577209d65265"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_company"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_12751da8bbd60b192e07e0b7021"`);

        // Drop saved_jobs table
        await queryRunner.query(`DROP INDEX "public"."IDX_967c8518b354a1d8173eec4080"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_07d13bb446cd7fc577209d6526"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dffd10892595a06f76e6473556"`);
        await queryRunner.query(`DROP TABLE "saved_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."saved_jobs_status_enum"`);

        // Drop jobs table
        await queryRunner.query(`DROP INDEX "public"."IDX_07b083837ee3154d890b7a9bd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0438611f1bd3705dc884cfcc06"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_jobs_companyId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12751da8bbd60b192e07e0b702"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b479c0773df215563963543bc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0c30e3eb9649fe7fbcd336a63"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_employmenttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."jobs_seniority_enum"`);

        // Drop companies table - platform is VARCHAR, no ENUM to drop
        await queryRunner.query(`DROP INDEX "public"."IDX_b28b07d25e4324eee577de5496"`);
        await queryRunner.query(`DROP TABLE "companies"`);
    }

}
