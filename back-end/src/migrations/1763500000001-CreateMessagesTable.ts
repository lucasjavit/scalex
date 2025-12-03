import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMessagesTable1763500000001 implements MigrationInterface {
  name = 'CreateMessagesTable1763500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "receiver_id" uuid NOT NULL,
        "content" text NOT NULL,
        "attachment" varchar,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      );
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_conversation"
      FOREIGN KEY ("conversation_id")
      REFERENCES "conversations"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_sender"
      FOREIGN KEY ("sender_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_receiver"
      FOREIGN KEY ("receiver_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_messages_conversation_created"
      ON "messages" ("conversation_id", "created_at");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_receiver_read"
      ON "messages" ("receiver_id", "is_read");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages" CASCADE;`);
  }
}
