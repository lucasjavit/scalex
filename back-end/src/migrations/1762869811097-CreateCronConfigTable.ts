import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCronConfigTable1762869811097 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'cron_config',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'key',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'value',
                        type: 'varchar',
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
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

        // Insert default cron configuration (every 4 hours)
        await queryRunner.query(`
            INSERT INTO cron_config (id, key, value, description)
            VALUES (
                uuid_generate_v4(),
                'job_scraping_cron',
                '0 */4 * * *',
                'Cron expression for job scraping - runs every 4 hours by default'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('cron_config');
    }

}
