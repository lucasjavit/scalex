import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUserPermissionsTable1762296645736 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_permissions table
        await queryRunner.createTable(
            new Table({
                name: 'user_permissions',
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
                    },
                    {
                        name: 'learning_course',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'learning_conversation',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'business_accounting',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'business_career',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'business_jobs',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'business_insurance',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'business_banking',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        // Add foreign key to users table
        await queryRunner.createForeignKey(
            'user_permissions',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Create unique index on user_id (one permission record per user)
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_user_permissions_user_id" ON "user_permissions" ("user_id")`,
        );

        // Create default permissions for existing users (all users get conversation by default)
        await queryRunner.query(
            `INSERT INTO user_permissions (user_id, learning_conversation)
             SELECT id, true FROM users WHERE role = 'user'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the table (foreign keys and indexes will be dropped automatically)
        await queryRunner.dropTable('user_permissions');
    }

}
