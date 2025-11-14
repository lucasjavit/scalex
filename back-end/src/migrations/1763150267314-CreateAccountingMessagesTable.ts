import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, TableCheck } from 'typeorm';

/**
 * CreateAccountingMessagesTable Migration
 *
 * Creates the accounting_messages table for chat/messaging between users and accountants.
 *
 * Features:
 * - Messages can be linked to either a request (pre-company) OR a company (post-company)
 * - Track sender/receiver
 * - Support file attachments
 * - Read/unread status tracking
 * - CHECK constraint ensures message is linked to either request OR company (XOR)
 *
 * Following database best practices:
 * - 3NF normalization
 * - UUID primary keys
 * - Proper foreign keys with CASCADE/SET NULL
 * - Indexes on FKs and query fields
 * - TIMESTAMP WITH TIME ZONE
 * - Constraints for data integrity
 */
export class CreateAccountingMessagesTable1763150267314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create accounting_messages table
    await queryRunner.createTable(
      new Table({
        name: 'accounting_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            comment: 'Message unique identifier',
          },
          {
            name: 'request_id',
            type: 'uuid',
            isNullable: true,
            comment: 'FK to company_registration_requests (for pre-company chat)',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: true,
            comment: 'FK to companies (for post-company chat)',
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: false,
            comment: 'FK to users (who sent the message)',
          },
          {
            name: 'receiver_id',
            type: 'uuid',
            isNullable: false,
            comment: 'FK to users (who receives the message)',
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
            comment: 'Message content',
          },
          {
            name: 'attachment_path',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Path to attached file (if any)',
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether message has been read',
          },
          {
            name: 'read_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'When message was read',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
            isNullable: false,
            comment: 'Message creation timestamp',
          },
        ],
      }),
      true,
    );

    // Add CHECK constraint: message must be linked to EITHER request OR company (XOR)
    await queryRunner.createCheckConstraint(
      'accounting_messages',
      new TableCheck({
        name: 'chk_accounting_messages_request_or_company',
        expression: `(
          (request_id IS NOT NULL AND company_id IS NULL) OR
          (request_id IS NULL AND company_id IS NOT NULL)
        )`,
      }),
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'accounting_messages',
      new TableForeignKey({
        name: 'fk_accounting_messages_request',
        columnNames: ['request_id'],
        referencedTableName: 'company_registration_requests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Delete messages when request is deleted
      }),
    );

    // TODO: Add FK to companies when companies table is created (STEP 15)
    // await queryRunner.createForeignKey(
    //   'accounting_messages',
    //   new TableForeignKey({
    //     name: 'fk_accounting_messages_company',
    //     columnNames: ['company_id'],
    //     referencedTableName: 'companies',
    //     referencedColumnNames: ['id'],
    //     onDelete: 'CASCADE', // Delete messages when company is deleted
    //   }),
    // );

    await queryRunner.createForeignKey(
      'accounting_messages',
      new TableForeignKey({
        name: 'fk_accounting_messages_sender',
        columnNames: ['sender_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Delete messages when sender is deleted
      }),
    );

    await queryRunner.createForeignKey(
      'accounting_messages',
      new TableForeignKey({
        name: 'fk_accounting_messages_receiver',
        columnNames: ['receiver_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Delete messages when receiver is deleted
      }),
    );

    // Indexes for performance
    // Index on request_id for filtering messages by request
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_request_id',
        columnNames: ['request_id'],
      }),
    );

    // Index on company_id for filtering messages by company
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_company_id',
        columnNames: ['company_id'],
      }),
    );

    // Index on sender_id
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_sender_id',
        columnNames: ['sender_id'],
      }),
    );

    // Index on receiver_id for getting messages received by a user
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_receiver_id',
        columnNames: ['receiver_id'],
      }),
    );

    // Composite index on receiver_id + is_read for unread messages query
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_receiver_is_read',
        columnNames: ['receiver_id', 'is_read'],
      }),
    );

    // Index on created_at for sorting messages chronologically
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Composite index for request messages ordered by time
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_request_created',
        columnNames: ['request_id', 'created_at'],
      }),
    );

    // Composite index for company messages ordered by time
    await queryRunner.createIndex(
      'accounting_messages',
      new TableIndex({
        name: 'idx_accounting_messages_company_created',
        columnNames: ['company_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (cascades will handle indexes, FKs, and constraints)
    await queryRunner.dropTable('accounting_messages', true);
  }
}
