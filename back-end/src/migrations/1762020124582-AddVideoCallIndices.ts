import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoCallIndices1762020124582 implements MigrationInterface {
    name = 'AddVideoCallIndices1762020124582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('🔧 Adding Video Call indices for optimized query performance...');

        // Create indices for video_call_sessions table
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_SESSIONS_ROOM_NAME"
            ON "video_call_sessions" ("room_name")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_SESSIONS_EXPIRES_AT"
            ON "video_call_sessions" ("expires_at")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_SESSIONS_STATUS_EXPIRES"
            ON "video_call_sessions" ("status", "expires_at")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_SESSIONS_STATUS_CREATED"
            ON "video_call_sessions" ("status", "created_at")
        `);

        // Create indices for video_call_queue table
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_QUEUE_LEVEL_STATUS"
            ON "video_call_queue" ("level", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_VIDEO_CALL_QUEUE_STATUS_JOINED"
            ON "video_call_queue" ("status", "joined_at")
        `);

        console.log('✅ Video Call indices created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('🔙 Removing Video Call indices...');

        // Drop video_call_queue indices
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_QUEUE_STATUS_JOINED"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_QUEUE_LEVEL_STATUS"`);

        // Drop video_call_sessions indices
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_SESSIONS_STATUS_CREATED"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_SESSIONS_STATUS_EXPIRES"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_SESSIONS_EXPIRES_AT"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_VIDEO_CALL_SESSIONS_ROOM_NAME"`);

        console.log('✅ Video Call indices removed successfully');
    }

}
