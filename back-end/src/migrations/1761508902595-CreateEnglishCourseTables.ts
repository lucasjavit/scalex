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

        // Seed initial data
        await this.seedInitialData(queryRunner);
    }

    private async seedInitialData(queryRunner: QueryRunner): Promise<void> {
        console.log('Seeding initial English Course data...');

        // Insert Stages
        await queryRunner.query(`
            INSERT INTO stages (id, title, description, order_index) VALUES
            (gen_random_uuid(), 'Foundation: Essential Communication', 'Build your core vocabulary and master fundamental communication skills', 1),
            (gen_random_uuid(), 'Professional: Advanced Communication', 'Develop professional language skills for business and academic contexts', 2),
            (gen_random_uuid(), 'Mastery: Native-Level Fluency', 'Achieve native-level proficiency with complex grammar and idiomatic expressions', 3);
        `);

        console.log('✓ Seeded 3 stages');

        // Get stage IDs
        const stages = await queryRunner.query(`SELECT id, title FROM stages ORDER BY order_index`);

        // Insert Units for Stage 1 (Beginner)
        await queryRunner.query(`
            INSERT INTO units (id, stage_id, title, description, youtube_url, video_duration, order_index) VALUES
            (gen_random_uuid(), '${stages[0].id}', 'Greetings and Introductions', 'Learn how to greet people and introduce yourself', 'https://www.youtube.com/watch?v=7kjCPPSLiD8', 600, 1),
            (gen_random_uuid(), '${stages[0].id}', 'Numbers and Alphabet', 'Learn numbers from 1-100 and the English alphabet', 'https://www.youtube.com/watch?v=v4FC7wbmTWk', 480, 2),
            (gen_random_uuid(), '${stages[0].id}', 'Common Phrases', 'Learn everyday English phrases', 'https://www.youtube.com/watch?v=Kbs1bq-jpxQ', 720, 3);
        `);

        // Get units for Stage 1
        const stage1Units = await queryRunner.query(`SELECT id FROM units WHERE stage_id = '${stages[0].id}' ORDER BY order_index`);

        // Insert Cards for Unit 1
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage1Units[0].id}', 'Como se diz "Olá" em inglês?', 'Hello', 'Hello, how are you?', 1),
            (gen_random_uuid(), '${stage1Units[0].id}', 'Como se diz "Bom dia" em inglês?', 'Good morning', 'Good morning! Did you sleep well?', 2),
            (gen_random_uuid(), '${stage1Units[0].id}', 'Como se diz "Prazer em conhecê-lo" em inglês?', 'Nice to meet you', 'Nice to meet you! My name is John.', 3),
            (gen_random_uuid(), '${stage1Units[0].id}', 'Como se diz "Como vai?" em inglês?', 'How are you?', 'Hi Sarah! How are you doing today?', 4),
            (gen_random_uuid(), '${stage1Units[0].id}', 'Como se diz "Tchau" em inglês?', 'Goodbye', 'Goodbye! See you tomorrow.', 5);
        `);

        // Insert Cards for Unit 2
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage1Units[1].id}', 'Como se diz o número "1" em inglês?', 'One', 'I have one apple.', 1),
            (gen_random_uuid(), '${stage1Units[1].id}', 'Como se diz o número "10" em inglês?', 'Ten', 'There are ten students in the class.', 2),
            (gen_random_uuid(), '${stage1Units[1].id}', 'Como se diz o número "20" em inglês?', 'Twenty', 'I am twenty years old.', 3),
            (gen_random_uuid(), '${stage1Units[1].id}', 'Como se diz o número "100" em inglês?', 'One hundred', 'This book has one hundred pages.', 4);
        `);

        // Insert Cards for Unit 3
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage1Units[2].id}', 'Como se diz "Por favor" em inglês?', 'Please', 'Can you help me, please?', 1),
            (gen_random_uuid(), '${stage1Units[2].id}', 'Como se diz "Obrigado" em inglês?', 'Thank you', 'Thank you for your help!', 2),
            (gen_random_uuid(), '${stage1Units[2].id}', 'Como se diz "De nada" em inglês?', 'You''re welcome', 'You''re welcome! Anytime.', 3),
            (gen_random_uuid(), '${stage1Units[2].id}', 'Como se diz "Desculpe" em inglês?', 'Sorry / Excuse me', 'Sorry, I didn''t mean to interrupt.', 4),
            (gen_random_uuid(), '${stage1Units[2].id}', 'Como se diz "Com licença" em inglês?', 'Excuse me', 'Excuse me, where is the bathroom?', 5);
        `);

        console.log('✓ Seeded 3 units and 14 cards for Stage 1 (Beginner)');

        // Insert Units for Stage 2 (Intermediate)
        await queryRunner.query(`
            INSERT INTO units (id, stage_id, title, description, youtube_url, video_duration, order_index) VALUES
            (gen_random_uuid(), '${stages[1].id}', 'Present Perfect Tense', 'Master the present perfect tense', 'https://www.youtube.com/watch?v=hX-NlYSrMh8', 540, 1),
            (gen_random_uuid(), '${stages[1].id}', 'Phrasal Verbs', 'Learn common phrasal verbs', 'https://www.youtube.com/watch?v=wOlS2S_qpgg', 660, 2);
        `);

        // Get units for Stage 2
        const stage2Units = await queryRunner.query(`SELECT id FROM units WHERE stage_id = '${stages[1].id}' ORDER BY order_index`);

        // Insert Cards for Unit 4
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage2Units[0].id}', 'Complete: I ____ (visit) Paris three times.', 'have visited', 'I have visited Paris three times.', 1),
            (gen_random_uuid(), '${stage2Units[0].id}', 'Complete: She ____ (not finish) her homework yet.', 'hasn''t finished', 'She hasn''t finished her homework yet.', 2),
            (gen_random_uuid(), '${stage2Units[0].id}', 'Complete: ____ you ever ____ (eat) sushi?', 'Have / eaten', 'Have you ever eaten sushi?', 3);
        `);

        // Insert Cards for Unit 5
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage2Units[1].id}', 'O que significa "give up"?', 'Desistir', 'Don''t give up on your dreams!', 1),
            (gen_random_uuid(), '${stage2Units[1].id}', 'O que significa "look after"?', 'Cuidar de', 'Can you look after my cat this weekend?', 2),
            (gen_random_uuid(), '${stage2Units[1].id}', 'O que significa "turn on"?', 'Ligar (aparelho)', 'Please turn on the lights.', 3),
            (gen_random_uuid(), '${stage2Units[1].id}', 'O que significa "turn off"?', 'Desligar (aparelho)', 'Don''t forget to turn off the TV.', 4);
        `);

        console.log('✓ Seeded 2 units and 7 cards for Stage 2 (Intermediate)');

        // Insert Units for Stage 3 (Advanced)
        await queryRunner.query(`
            INSERT INTO units (id, stage_id, title, description, youtube_url, video_duration, order_index) VALUES
            (gen_random_uuid(), '${stages[2].id}', 'Business English', 'Learn professional English for business', 'https://www.youtube.com/watch?v=czhY3xYDRlc', 900, 1);
        `);

        // Get units for Stage 3
        const stage3Units = await queryRunner.query(`SELECT id FROM units WHERE stage_id = '${stages[2].id}' ORDER BY order_index`);

        // Insert Cards for Unit 6
        await queryRunner.query(`
            INSERT INTO cards (id, unit_id, question, answer, example_sentence, order_index) VALUES
            (gen_random_uuid(), '${stage3Units[0].id}', 'Como se diz "reunião" em inglês?', 'Meeting', 'We have a meeting at 3 PM.', 1),
            (gen_random_uuid(), '${stage3Units[0].id}', 'Como se diz "prazo" em inglês?', 'Deadline', 'The deadline for this project is Friday.', 2),
            (gen_random_uuid(), '${stage3Units[0].id}', 'Como se diz "acordo" em inglês?', 'Agreement / Deal', 'We reached an agreement with the client.', 3);
        `);

        console.log('✓ Seeded 1 unit and 3 cards for Stage 3 (Advanced)');
        console.log('✅ Successfully seeded English Course data!');
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
