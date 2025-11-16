import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: CreateCompanyDocumentsTable
 *
 * Creates the company_documents table to store documents related to companies.
 *
 * This table stores all documents uploaded after a company is created, including:
 * - Constituição (bylaws, amendments)
 * - Registros (CNPJ card, licenses, MEI certificate)
 * - Certidões (negative certificates from federal, state, municipal)
 * - Fiscais (paid tax guides, declarations)
 *
 * Features:
 * - Document categorization by type and category
 * - Expiration date tracking for certificates
 * - File metadata (name, path, size)
 * - Upload tracking (who uploaded and when)
 * - Links to companies and uploaders
 * - Comprehensive indexing for performance
 */
export class CreateCompanyDocumentsTable1763322182694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'company_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique identifier for the document',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Company that owns this document',
          },
          {
            name: 'uploaded_by_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User who uploaded the document (accountant or company owner)',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Document category: constituicao, registros, certidoes, fiscais',
          },
          {
            name: 'document_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Specific document type (e.g., "Contrato Social", "CNPJ Card")',
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Original file name',
          },
          {
            name: 'file_path',
            type: 'text',
            isNullable: false,
            comment: 'Path to file in storage',
          },
          {
            name: 'file_size',
            type: 'integer',
            isNullable: false,
            comment: 'File size in bytes',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'MIME type of the file (e.g., application/pdf)',
          },
          {
            name: 'expiration_date',
            type: 'date',
            isNullable: true,
            comment: 'Expiration date for certificates (null for permanent documents)',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Additional notes about the document',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Timestamp when document was uploaded',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Timestamp when document was last updated',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'company_documents',
      new TableForeignKey({
        name: 'fk_company_documents_company',
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'company_documents',
      new TableForeignKey({
        name: 'fk_company_documents_uploader',
        columnNames: ['uploaded_by_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_uploaded_by_id',
        columnNames: ['uploaded_by_id'],
      }),
    );

    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_expiration_date',
        columnNames: ['expiration_date'],
      }),
    );

    // Composite indexes for common queries
    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_company_category',
        columnNames: ['company_id', 'category'],
      }),
    );

    await queryRunner.createIndex(
      'company_documents',
      new TableIndex({
        name: 'idx_company_documents_company_created',
        columnNames: ['company_id', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_company_created');
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_company_category');
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_expiration_date');
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_category');
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_uploaded_by_id');
    await queryRunner.dropIndex('company_documents', 'idx_company_documents_company_id');

    await queryRunner.dropForeignKey('company_documents', 'fk_company_documents_uploader');
    await queryRunner.dropForeignKey('company_documents', 'fk_company_documents_company');

    await queryRunner.dropTable('company_documents', true);
  }
}
