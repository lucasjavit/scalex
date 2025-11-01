import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNAPhoneValue1762036230307 implements MigrationInterface {
    name = 'AllowNAPhoneValue1762036230307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_8ed32d83be57f1c0239124f5ab"`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`ALTER TABLE "video_call_usage_limits" ALTER COLUMN "last_reset_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "video_call_usage_limits" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_5f01b4e448d62474109131403b" CHECK ("phone" = 'N/A' OR "phone" ~* '^[\\d\\s\\-\\+\\(\\)]+$')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_5f01b4e448d62474109131403b"`);
        await queryRunner.query(`ALTER TABLE "video_call_usage_limits" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "video_call_usage_limits" ALTER COLUMN "last_reset_at" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_card_progress" ALTER COLUMN "ease_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_8ed32d83be57f1c0239124f5ab" CHECK (((phone)::text ~* '^[\\d\\s\\-\\+\\(\\)]+$'::text))`);
    }

}
