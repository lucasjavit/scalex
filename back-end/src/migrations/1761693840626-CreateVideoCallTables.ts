import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVideoCallTables1761693840626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabela: video_call_queue (Fila de espera)
    await queryRunner.createTable(
      new Table({
        name: 'video_call_queue',
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
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'level',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'topic',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'waiting'",
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

    // Index para buscar por user_id rapidamente
    await queryRunner.createIndex(
      'video_call_queue',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_QUEUE_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    // Index para buscar por status
    await queryRunner.createIndex(
      'video_call_queue',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_QUEUE_STATUS',
        columnNames: ['status'],
      }),
    );

    // 2. Tabela: video_call_sessions (Sessões ativas)
    await queryRunner.createTable(
      new Table({
        name: 'video_call_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'user1_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user2_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'room_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'level',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'topic',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'active'",
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

    // Index para buscar sessões por usuário
    await queryRunner.createIndex(
      'video_call_sessions',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_SESSIONS_USER1',
        columnNames: ['user1_id'],
      }),
    );

    await queryRunner.createIndex(
      'video_call_sessions',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_SESSIONS_USER2',
        columnNames: ['user2_id'],
      }),
    );

    // Index para buscar por status
    await queryRunner.createIndex(
      'video_call_sessions',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_SESSIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    // 3. Tabela: video_call_active_periods (Períodos configurados)
    await queryRunner.createTable(
      new Table({
        name: 'video_call_active_periods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'start_hour',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'start_minute',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'end_hour',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'end_minute',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Index para ordenação
    await queryRunner.createIndex(
      'video_call_active_periods',
      new TableIndex({
        name: 'IDX_VIDEO_CALL_PERIODS_ORDER',
        columnNames: ['order_index'],
      }),
    );

    // Inserir os 5 períodos padrão
    await queryRunner.query(`
            INSERT INTO video_call_active_periods (start_hour, start_minute, end_hour, end_minute, order_index, is_active)
            VALUES
                (7, 0, 9, 30, 0, true),   -- Manhã
                (12, 0, 13, 0, 1, true),  -- Almoço
                (15, 0, 16, 0, 2, true),  -- Tarde
                (19, 0, 20, 0, 3, true),  -- Noite 1
                (21, 0, 22, 30, 4, true); -- Noite 2
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('video_call_active_periods');
    await queryRunner.dropTable('video_call_sessions');
    await queryRunner.dropTable('video_call_queue');
  }
}
