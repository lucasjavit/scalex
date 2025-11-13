import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRssFeedsTable1762898252973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create rss_feeds table
        await queryRunner.createTable(
            new Table({
                name: 'rss_feeds',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'job_board_id',
                        type: 'uuid',
                    },
                    {
                        name: 'url',
                        type: 'varchar',
                        length: '500',
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '200',
                    },
                    {
                        name: 'enabled',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'last_scraped_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'scraping_status',
                        type: 'enum',
                        enum: ['pending', 'success', 'error'],
                        isNullable: true,
                    },
                    {
                        name: 'error_message',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add foreign key to job_boards
        await queryRunner.createForeignKey(
            'rss_feeds',
            new TableForeignKey({
                columnNames: ['job_board_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'job_boards',
                onDelete: 'CASCADE',
            }),
        );

        // Create index on job_board_id
        await queryRunner.query(`
            CREATE INDEX idx_rss_feeds_job_board_id ON rss_feeds(job_board_id);
        `);

        // Create index on enabled
        await queryRunner.query(`
            CREATE INDEX idx_rss_feeds_enabled ON rss_feeds(enabled);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('rss_feeds');
    }

}
