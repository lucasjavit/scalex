import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAccountingMessagesTable1763400000000
  implements MigrationInterface
{
  name = 'DropAccountingMessagesTable1763400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop accounting_messages table
    await queryRunner.query(`DROP TABLE IF EXISTS "accounting_messages" CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate accounting_messages table (reverse migration)
    await queryRunner.query(`
      CREATE TABLE "accounting_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "request_id" uuid,
        "company_id" uuid,
        "sender_id" uuid NOT NULL,
        "receiver_id" uuid NOT NULL,
        "message" text NOT NULL,
        "attachment" varchar,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_accounting_messages" PRIMARY KEY ("id")
      );
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "accounting_messages"
      ADD CONSTRAINT "FK_accounting_messages_request"
      FOREIGN KEY ("request_id")
      REFERENCES "company_registration_requests"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "accounting_messages"
      ADD CONSTRAINT "FK_accounting_messages_company"
      FOREIGN KEY ("company_id")
      REFERENCES "accounting_companies"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "accounting_messages"
      ADD CONSTRAINT "FK_accounting_messages_sender"
      FOREIGN KEY ("sender_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "accounting_messages"
      ADD CONSTRAINT "FK_accounting_messages_receiver"
      FOREIGN KEY ("receiver_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_accounting_messages_request"
      ON "accounting_messages" ("request_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounting_messages_company"
      ON "accounting_messages" ("company_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_accounting_messages_receiver_read"
      ON "accounting_messages" ("receiver_id", "is_read");
    `);
  }
}
