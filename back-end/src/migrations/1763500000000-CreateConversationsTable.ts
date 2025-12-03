import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConversationsTable1763500000000
  implements MigrationInterface
{
  name = 'CreateConversationsTable1763500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "partner_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "module_type" varchar NOT NULL,
        "last_message_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_conversations_partner_user_module" UNIQUE ("partner_id", "user_id", "module_type")
      );
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "conversations"
      ADD CONSTRAINT "FK_conversations_partner"
      FOREIGN KEY ("partner_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "conversations"
      ADD CONSTRAINT "FK_conversations_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_conversations_partner_module"
      ON "conversations" ("partner_id", "module_type");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_conversations_user_module"
      ON "conversations" ("user_id", "module_type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations" CASCADE;`);
  }
}
