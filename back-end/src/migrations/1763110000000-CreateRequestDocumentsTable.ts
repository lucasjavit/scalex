import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableCheck } from "typeorm";

export class CreateRequestDocumentsTable1763110000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create request_documents table
        await queryRunner.createTable(
            new Table({
                name: 'request_documents',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'request_id',
                        type: 'uuid',
                        isNullable: false,
                        comment: 'ID da solicitação de abertura de empresa',
                    },
                    {
                        name: 'uploaded_by',
                        type: 'uuid',
                        isNullable: false,
                        comment: 'Usuário que fez upload (user ou accountant)',
                    },
                    {
                        name: 'document_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                        comment: 'Tipo do documento: rg, cpf, comprovante_residencia, contrato_social, etc',
                    },
                    {
                        name: 'file_name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Nome original do arquivo',
                    },
                    {
                        name: 'file_path',
                        type: 'varchar',
                        length: '500',
                        isNullable: false,
                        comment: 'Caminho do arquivo no storage (local ou S3)',
                    },
                    {
                        name: 'file_size',
                        type: 'integer',
                        isNullable: false,
                        comment: 'Tamanho do arquivo em bytes',
                    },
                    {
                        name: 'mime_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: true,
                        comment: 'Tipo MIME do arquivo (application/pdf, image/jpeg, etc)',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Foreign Key: request_id -> company_registration_requests(id) ON DELETE CASCADE
        // Se a solicitação for deletada, os documentos também são deletados
        await queryRunner.createForeignKey(
            'request_documents',
            new TableForeignKey({
                name: 'fk_request_documents_request_id',
                columnNames: ['request_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'company_registration_requests',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // Foreign Key: uploaded_by -> users(id) ON DELETE SET NULL would be ideal,
        // but we need to know who uploaded, so we use RESTRICT
        // If need to delete user, must delete/reassign documents first
        await queryRunner.createForeignKey(
            'request_documents',
            new TableForeignKey({
                name: 'fk_request_documents_uploaded_by',
                columnNames: ['uploaded_by'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE',
            }),
        );

        // Check Constraint: validar tamanho do arquivo (máximo 50MB)
        await queryRunner.createCheckConstraint(
            'request_documents',
            new TableCheck({
                name: 'chk_request_documents_file_size',
                expression: 'file_size > 0 AND file_size <= 52428800', // 50MB = 50 * 1024 * 1024
            }),
        );

        // Check Constraint: validar tipos de documento permitidos
        await queryRunner.createCheckConstraint(
            'request_documents',
            new TableCheck({
                name: 'chk_request_documents_document_type',
                expression: `document_type IN (
                    'rg',
                    'cpf',
                    'comprovante_residencia',
                    'certidao_nascimento',
                    'certidao_casamento',
                    'titulo_eleitor',
                    'contrato_social',
                    'requerimento_mei',
                    'outros'
                )`,
            }),
        );

        // Índice: request_id (buscar documentos de uma solicitação) - MAIS COMUM
        await queryRunner.createIndex(
            'request_documents',
            new TableIndex({
                name: 'idx_request_documents_request_id',
                columnNames: ['request_id'],
            }),
        );

        // Índice: uploaded_by (buscar documentos enviados por um usuário)
        await queryRunner.createIndex(
            'request_documents',
            new TableIndex({
                name: 'idx_request_documents_uploaded_by',
                columnNames: ['uploaded_by'],
            }),
        );

        // Índice: document_type (filtrar por tipo de documento)
        await queryRunner.createIndex(
            'request_documents',
            new TableIndex({
                name: 'idx_request_documents_document_type',
                columnNames: ['document_type'],
            }),
        );

        // Índice: created_at (ordenar por data de upload)
        await queryRunner.createIndex(
            'request_documents',
            new TableIndex({
                name: 'idx_request_documents_created_at',
                columnNames: ['created_at'],
            }),
        );

        // Índice composto: request_id + document_type (busca comum: documentos de uma solicitação por tipo)
        await queryRunner.createIndex(
            'request_documents',
            new TableIndex({
                name: 'idx_request_documents_request_id_document_type',
                columnNames: ['request_id', 'document_type'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all indexes
        await queryRunner.dropIndex('request_documents', 'idx_request_documents_request_id_document_type');
        await queryRunner.dropIndex('request_documents', 'idx_request_documents_created_at');
        await queryRunner.dropIndex('request_documents', 'idx_request_documents_document_type');
        await queryRunner.dropIndex('request_documents', 'idx_request_documents_uploaded_by');
        await queryRunner.dropIndex('request_documents', 'idx_request_documents_request_id');

        // Drop check constraints
        await queryRunner.dropCheckConstraint('request_documents', 'chk_request_documents_document_type');
        await queryRunner.dropCheckConstraint('request_documents', 'chk_request_documents_file_size');

        // Drop foreign keys
        await queryRunner.dropForeignKey('request_documents', 'fk_request_documents_uploaded_by');
        await queryRunner.dropForeignKey('request_documents', 'fk_request_documents_request_id');

        // Drop table
        await queryRunner.dropTable('request_documents');
    }

}
