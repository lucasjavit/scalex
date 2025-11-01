import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsageLimitsTable1762024278821 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'video_call_usage_limits',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'total_rooms_created',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'total_minutes_used',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'max_rooms_allowed',
                        type: 'int',
                        default: 100000, // 100k rooms limit
                    },
                    {
                        name: 'max_minutes_allowed',
                        type: 'int',
                        default: 10000, // 10k minutes limit
                    },
                    {
                        name: 'last_reset_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Insert initial record
        await queryRunner.query(`
            INSERT INTO video_call_usage_limits (total_rooms_created, total_minutes_used, max_rooms_allowed, max_minutes_allowed)
            VALUES (0, 0, 100000, 10000)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('video_call_usage_limits');
    }

}
