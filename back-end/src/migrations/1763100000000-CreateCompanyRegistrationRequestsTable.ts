import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableCheck } from "typeorm";

export class CreateCompanyRegistrationRequestsTable1763100000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create company_registration_requests table
        await queryRunner.createTable(
            new Table({
                name: 'company_registration_requests',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'assigned_to',
                        type: 'uuid',
                        isNullable: true,
                        comment: 'Contador (partner_cnpj) atribuído à solicitação',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                        default: "'pending'",
                        comment: 'Status da solicitação: pending, in_progress, waiting_documents, processing, completed, cancelled',
                    },
                    {
                        name: 'request_data',
                        type: 'jsonb',
                        isNullable: false,
                        comment: 'Dados do formulário de solicitação (nome, CPF, tipo de empresa, etc)',
                    },
                    {
                        name: 'company_id',
                        type: 'uuid',
                        isNullable: true,
                        comment: 'Empresa criada após conclusão do processo',
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
                    {
                        name: 'completed_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                        comment: 'Data de conclusão da abertura da empresa',
                    },
                    {
                        name: 'cancelled_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                        comment: 'Data de cancelamento da solicitação',
                    },
                ],
            }),
            true,
        );

        // Foreign Key: user_id -> users(id) ON DELETE CASCADE
        // Se o usuário for deletado, suas solicitações também são deletadas
        await queryRunner.createForeignKey(
            'company_registration_requests',
            new TableForeignKey({
                name: 'fk_company_registration_requests_user_id',
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // Foreign Key: assigned_to -> users(id) ON DELETE SET NULL
        // Se o contador for deletado, a solicitação continua existindo mas sem contador atribuído
        await queryRunner.createForeignKey(
            'company_registration_requests',
            new TableForeignKey({
                name: 'fk_company_registration_requests_assigned_to',
                columnNames: ['assigned_to'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );

        // Nota: A FK para companies será criada quando a tabela companies existir
        // Por enquanto, comentamos essa FK para evitar erro
        // TODO: Adicionar FK para company_id quando tabela companies for criada

        // Check Constraint: validar valores de status
        await queryRunner.createCheckConstraint(
            'company_registration_requests',
            new TableCheck({
                name: 'chk_company_registration_requests_status',
                expression: `status IN ('pending', 'in_progress', 'waiting_documents', 'processing', 'completed', 'cancelled')`,
            }),
        );

        // Índice: user_id (buscar solicitações de um usuário)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_user_id',
                columnNames: ['user_id'],
            }),
        );

        // Índice: assigned_to (buscar solicitações de um contador)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_assigned_to',
                columnNames: ['assigned_to'],
            }),
        );

        // Índice: status (filtrar por status)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_status',
                columnNames: ['status'],
            }),
        );

        // Índice: created_at (ordenar por data de criação)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_created_at',
                columnNames: ['created_at'],
            }),
        );

        // Índice composto: status + created_at (query comum: listar por status ordenado por data)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_status_created_at',
                columnNames: ['status', 'created_at'],
            }),
        );

        // Índice: company_id (buscar solicitação de uma empresa)
        await queryRunner.createIndex(
            'company_registration_requests',
            new TableIndex({
                name: 'idx_company_registration_requests_company_id',
                columnNames: ['company_id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all indexes (exceto a PK que é dropada automaticamente)
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_company_id');
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_status_created_at');
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_created_at');
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_status');
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_assigned_to');
        await queryRunner.dropIndex('company_registration_requests', 'idx_company_registration_requests_user_id');

        // Drop check constraint
        await queryRunner.dropCheckConstraint('company_registration_requests', 'chk_company_registration_requests_status');

        // Drop foreign keys
        await queryRunner.dropForeignKey('company_registration_requests', 'fk_company_registration_requests_assigned_to');
        await queryRunner.dropForeignKey('company_registration_requests', 'fk_company_registration_requests_user_id');

        // Drop table
        await queryRunner.dropTable('company_registration_requests');
    }

}
