import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEnglishCourseTables1761508902595 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create stages table
        await queryRunner.query(`
            CREATE TABLE stages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                order_index INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_stages_order ON stages(order_index);
        `);

        // 2. Create units table
        await queryRunner.query(`
            CREATE TABLE units (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                youtube_url VARCHAR(500) NOT NULL,
                thumbnail_url VARCHAR(500),
                video_duration INTEGER,
                order_index INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_units_stage_id ON units(stage_id);
            CREATE INDEX idx_units_order ON units(stage_id, order_index);
        `);

        // 3. Create cards table
        await queryRunner.query(`
            CREATE TABLE cards (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                example_sentence TEXT,
                audio_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_cards_unit_id ON cards(unit_id);
        `);

        // 4. Create user_stage_progress table
        await queryRunner.query(`
            CREATE TABLE user_stage_progress (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
                is_completed BOOLEAN DEFAULT FALSE,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                UNIQUE(user_id, stage_id)
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_user_stage_progress_user_id ON user_stage_progress(user_id);
            CREATE INDEX idx_user_stage_progress_stage_id ON user_stage_progress(stage_id);
        `);

        // 5. Create user_unit_progress table
        await queryRunner.query(`
            CREATE TABLE user_unit_progress (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
                watch_time_seconds INTEGER DEFAULT 0,
                is_completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, unit_id)
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_user_unit_progress_user_id ON user_unit_progress(user_id);
            CREATE INDEX idx_user_unit_progress_unit_id ON user_unit_progress(unit_id);
        `);

        // 6. Create user_card_progress table
        await queryRunner.query(`
            CREATE TABLE user_card_progress (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
                ease_factor DECIMAL(3,2) DEFAULT 2.5,
                interval INTEGER DEFAULT 0,
                repetitions INTEGER DEFAULT 0,
                state VARCHAR(20) DEFAULT 'new',
                next_review_date TIMESTAMP NOT NULL,
                last_reviewed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, card_id)
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_user_card_progress_user_id ON user_card_progress(user_id);
            CREATE INDEX idx_user_card_progress_card_id ON user_card_progress(card_id);
            CREATE INDEX idx_user_card_progress_next_review ON user_card_progress(next_review_date);
            CREATE INDEX idx_user_card_progress_state ON user_card_progress(state);
        `);

        // 7. Create review_sessions table
        await queryRunner.query(`
            CREATE TABLE review_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
                result VARCHAR(20) NOT NULL,
                time_taken_seconds INTEGER,
                ease_factor_after DECIMAL(3,2),
                interval_after INTEGER,
                reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_review_sessions_user_id ON review_sessions(user_id);
            CREATE INDEX idx_review_sessions_card_id ON review_sessions(card_id);
            CREATE INDEX idx_review_sessions_reviewed_at ON review_sessions(reviewed_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order (respecting foreign key constraints)
        await queryRunner.query(`DROP TABLE IF EXISTS review_sessions CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_card_progress CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_unit_progress CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_stage_progress CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS cards CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS units CASCADE;`);
        await queryRunner.query(`DROP TABLE IF EXISTS stages CASCADE;`);
    }

}
