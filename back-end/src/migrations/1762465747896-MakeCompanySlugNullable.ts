import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCompanySlugNullable1762465747896 implements MigrationInterface {
    name = 'MakeCompanySlugNullable1762465747896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_12751da8bbd60b192e07e0b7021"`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "companySlug" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_12751da8bbd60b192e07e0b7021" FOREIGN KEY ("companySlug") REFERENCES "companies"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_12751da8bbd60b192e07e0b7021"`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "companySlug" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_12751da8bbd60b192e07e0b7021" FOREIGN KEY ("companySlug") REFERENCES "companies"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
