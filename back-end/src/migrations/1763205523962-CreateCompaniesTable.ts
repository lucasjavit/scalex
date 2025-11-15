import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Migration: CreateCompaniesTable
 *
 * Creates the companies table to store registered companies after CNPJ opening.
 *
 * This table represents companies that have been successfully registered
 * through the accounting module, linking back to the original request.
 *
 * Features:
 * - Stores complete company information (legal name, CNPJ, address, etc.)
 * - Links to user (owner), accountant (who registered), and original request
 * - Supports different company types (MEI, ME, EIRELI, LTDA, SA)
 * - Tracks tax regime (Simples Nacional, Lucro Presumido, Lucro Real)
 * - JSONB for flexible address storage
 * - Status tracking (active, inactive, suspended)
 * - Comprehensive indexing for performance
 */
export class CreateCompaniesTable1763205523962 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique identifier for the company',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Owner/user who requested the CNPJ opening',
          },
          {
            name: 'accountant_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Accountant who registered/manages the company',
          },
          {
            name: 'request_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Original registration request (if created through system)',
          },
          {
            name: 'legal_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Legal/registered name of the company (Razão Social)',
          },
          {
            name: 'trade_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Trade/fantasy name (Nome Fantasia)',
          },
          {
            name: 'cnpj',
            type: 'varchar',
            length: '18',
            isNullable: false,
            isUnique: true,
            comment: 'CNPJ number (formatted: XX.XXX.XXX/XXXX-XX)',
          },
          {
            name: 'company_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Type of company: MEI, ME, EIRELI, LTDA, SA',
          },
          {
            name: 'main_activity',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: 'Main business activity (CNAE code + description)',
          },
          {
            name: 'tax_regime',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Tax regime: Simples Nacional, Lucro Presumido, Lucro Real',
          },
          {
            name: 'opening_date',
            type: 'date',
            isNullable: false,
            comment: 'Official company opening/registration date',
          },
          {
            name: 'estimated_revenue',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
            default: 0,
            comment: 'Estimated annual revenue in BRL',
          },
          {
            name: 'address',
            type: 'jsonb',
            isNullable: false,
            comment: 'Company address (street, number, complement, neighborhood, city, state, zip_code)',
          },
          {
            name: 'state_registration',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'State tax registration number (Inscrição Estadual)',
          },
          {
            name: 'municipal_registration',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Municipal tax registration number (Inscrição Municipal)',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'active'",
            comment: 'Company status: active, inactive, suspended',
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
      'companies',
      new TableForeignKey({
        name: 'fk_companies_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'companies',
      new TableForeignKey({
        name: 'fk_companies_accountant',
        columnNames: ['accountant_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'companies',
      new TableForeignKey({
        name: 'fk_companies_request',
        columnNames: ['request_id'],
        referencedTableName: 'company_registration_requests',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_accountant_id',
        columnNames: ['accountant_id'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_request_id',
        columnNames: ['request_id'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_cnpj',
        columnNames: ['cnpj'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'companies',
      new TableIndex({
        name: 'idx_companies_accountant_status',
        columnNames: ['accountant_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('companies', 'idx_companies_accountant_status');
    await queryRunner.dropIndex('companies', 'idx_companies_user_status');
    await queryRunner.dropIndex('companies', 'idx_companies_created_at');
    await queryRunner.dropIndex('companies', 'idx_companies_status');
    await queryRunner.dropIndex('companies', 'idx_companies_cnpj');
    await queryRunner.dropIndex('companies', 'idx_companies_request_id');
    await queryRunner.dropIndex('companies', 'idx_companies_accountant_id');
    await queryRunner.dropIndex('companies', 'idx_companies_user_id');

    await queryRunner.dropForeignKey('companies', 'fk_companies_request');
    await queryRunner.dropForeignKey('companies', 'fk_companies_accountant');
    await queryRunner.dropForeignKey('companies', 'fk_companies_user');

    await queryRunner.dropTable('companies', true);
  }
}
