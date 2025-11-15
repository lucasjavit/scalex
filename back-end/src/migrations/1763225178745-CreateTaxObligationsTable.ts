import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: CreateTaxObligationsTable
 *
 * Creates the tax_obligations table to store tax payments and obligations for companies.
 *
 * This table represents monthly/periodic tax obligations (DAS, DARF, GPS, etc.)
 * that companies must pay. Accountants generate these obligations and users pay them.
 *
 * Features:
 * - Stores tax obligation information (type, amount, due date, status)
 * - Links to company and accountant who generated it
 * - Supports different tax types (DAS, DARF, GPS, ISS, ICMS, etc.)
 * - Tracks payment status and history
 * - Stores barcode and payment link for easy payment
 * - Comprehensive indexing for performance
 */
export class CreateTaxObligationsTable1763225178745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tax_obligations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique identifier for the tax obligation',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Company that must pay this tax',
          },
          {
            name: 'generated_by_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Accountant who generated this obligation',
          },
          {
            name: 'tax_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment:
              'Type of tax: DAS, DARF, GPS, ISS, ICMS, IRPJ, CSLL, PIS, COFINS, INSS, FGTS',
          },
          {
            name: 'reference_month',
            type: 'varchar',
            length: '7',
            isNullable: false,
            comment: 'Reference month in format YYYY-MM (e.g., 2024-01)',
          },
          {
            name: 'due_date',
            type: 'date',
            isNullable: false,
            comment: 'Payment due date',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            comment: 'Tax amount in BRL',
          },
          {
            name: 'fine_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            default: 0,
            comment: 'Fine amount for late payment in BRL',
          },
          {
            name: 'interest_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            default: 0,
            comment: 'Interest amount for late payment in BRL',
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            comment: 'Total amount (amount + fine + interest) in BRL',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'pending'",
            comment: 'Status: pending, paid, overdue, cancelled',
          },
          {
            name: 'barcode',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Barcode for payment (boleto line)',
          },
          {
            name: 'payment_link',
            type: 'text',
            isNullable: true,
            comment: 'URL link for online payment',
          },
          {
            name: 'document_url',
            type: 'text',
            isNullable: true,
            comment: 'URL to download the tax document (PDF)',
          },
          {
            name: 'paid_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: 'Timestamp when payment was confirmed',
          },
          {
            name: 'paid_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
            comment: 'Actual amount paid in BRL',
          },
          {
            name: 'payment_confirmation',
            type: 'text',
            isNullable: true,
            comment: 'Payment confirmation number or receipt',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Additional notes from accountant',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Timestamp when record was created',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Timestamp when record was last updated',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'tax_obligations',
      new TableForeignKey({
        name: 'fk_tax_obligations_company',
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tax_obligations',
      new TableForeignKey({
        name: 'fk_tax_obligations_accountant',
        columnNames: ['generated_by_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_generated_by_id',
        columnNames: ['generated_by_id'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_due_date',
        columnNames: ['due_date'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_reference_month',
        columnNames: ['reference_month'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_tax_type',
        columnNames: ['tax_type'],
      }),
    );

    // Composite indexes for common queries
    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_company_status',
        columnNames: ['company_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_company_due_date',
        columnNames: ['company_id', 'due_date'],
      }),
    );

    await queryRunner.createIndex(
      'tax_obligations',
      new TableIndex({
        name: 'idx_tax_obligations_company_reference',
        columnNames: ['company_id', 'reference_month'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_company_reference');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_company_due_date');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_company_status');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_tax_type');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_reference_month');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_due_date');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_status');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_generated_by_id');
    await queryRunner.dropIndex('tax_obligations', 'idx_tax_obligations_company_id');

    await queryRunner.dropForeignKey('tax_obligations', 'fk_tax_obligations_accountant');
    await queryRunner.dropForeignKey('tax_obligations', 'fk_tax_obligations_company');

    await queryRunner.dropTable('tax_obligations', true);
  }
}
