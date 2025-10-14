-- ScaleX Database Schema
-- Simplified structure with string values

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_birth_date CHECK (birth_date <= CURRENT_DATE),
    CONSTRAINT check_phone_format CHECK (phone ~* '^[\d\s\-\+\(\)]+$')
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL DEFAULT 'primary',
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_address_type CHECK (address_type IN ('primary', 'billing', 'shipping', 'other'))
);

-- ============================================
-- ENGLISH COURSE TABLES (Callan Method Style)
-- ============================================

-- Lessons table - Contains lesson content
CREATE TABLE IF NOT EXISTS english_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_number INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(20) NOT NULL DEFAULT 'beginner',
    grammar_focus TEXT,
    vocabulary_focus TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_level CHECK (level IN ('beginner', 'elementary', 'intermediate', 'advanced')),
    CONSTRAINT check_lesson_number_positive CHECK (lesson_number > 0)
);

-- Questions table - Contains cards for practice (front/back style)
CREATE TABLE IF NOT EXISTS english_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES english_lessons(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    front_text TEXT NOT NULL, -- English phrase/sentence
    back_text TEXT NOT NULL,  -- Portuguese translation
    grammar_point VARCHAR(255),
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
    CONSTRAINT check_question_number_positive CHECK (question_number > 0),
    CONSTRAINT unique_lesson_question UNIQUE (lesson_id, question_number)
);

-- User Progress table - Tracks user progress through lessons
CREATE TABLE IF NOT EXISTS english_user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES english_lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    correct_answers INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_status CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_review')),
    CONSTRAINT check_correct_answers_positive CHECK (correct_answers >= 0),
    CONSTRAINT check_total_attempts_positive CHECK (total_attempts >= 0),
    CONSTRAINT check_accuracy CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    CONSTRAINT check_time_positive CHECK (time_spent_minutes >= 0),
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- Reviews table - Tracks scheduled reviews for spaced repetition (Callan method)
CREATE TABLE IF NOT EXISTS english_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES english_lessons(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES english_questions(id) ON DELETE CASCADE,
    review_count INTEGER DEFAULT 0,
    next_review_date TIMESTAMP NOT NULL,
    interval_days INTEGER DEFAULT 1,
    ease_factor DECIMAL(3,2) DEFAULT 2.50,
    last_reviewed_at TIMESTAMP,
    is_due BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_review_count_positive CHECK (review_count >= 0),
    CONSTRAINT check_interval_positive CHECK (interval_days > 0),
    CONSTRAINT check_ease_factor CHECK (ease_factor >= 1.30 AND ease_factor <= 3.00),
    CONSTRAINT unique_user_question_review UNIQUE (user_id, question_id)
);

-- Answer History table - Tracks all user answers for analytics
CREATE TABLE IF NOT EXISTS english_answer_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES english_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_seconds INTEGER,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_response_time_positive CHECK (response_time_seconds IS NULL OR response_time_seconds >= 0)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Addresses indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_primary ON addresses(is_primary);
CREATE INDEX IF NOT EXISTS idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country);

-- English Course indexes
CREATE INDEX IF NOT EXISTS idx_english_lessons_level ON english_lessons(level);
CREATE INDEX IF NOT EXISTS idx_english_lessons_is_active ON english_lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_english_questions_lesson_id ON english_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_english_questions_difficulty ON english_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_english_user_progress_user_id ON english_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_english_user_progress_lesson_id ON english_user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_english_user_progress_status ON english_user_progress(status);
CREATE INDEX IF NOT EXISTS idx_english_reviews_user_id ON english_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_english_reviews_next_review_date ON english_reviews(next_review_date);
CREATE INDEX IF NOT EXISTS idx_english_reviews_is_due ON english_reviews(is_due);
CREATE INDEX IF NOT EXISTS idx_english_answer_history_user_id ON english_answer_history(user_id);
CREATE INDEX IF NOT EXISTS idx_english_answer_history_question_id ON english_answer_history(question_id);
CREATE INDEX IF NOT EXISTS idx_english_answer_history_created_at ON english_answer_history(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if exist (for idempotency)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS ensure_one_primary_address_trigger ON addresses;
DROP TRIGGER IF EXISTS update_english_lessons_updated_at ON english_lessons;
DROP TRIGGER IF EXISTS update_english_questions_updated_at ON english_questions;
DROP TRIGGER IF EXISTS update_english_user_progress_updated_at ON english_user_progress;
DROP TRIGGER IF EXISTS update_english_reviews_updated_at ON english_reviews;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary address per user
CREATE OR REPLACE FUNCTION ensure_one_primary_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE addresses
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_primary = TRUE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_one_primary_address_trigger
    BEFORE INSERT OR UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_primary_address();

-- Triggers for English Course tables
CREATE TRIGGER update_english_lessons_updated_at
    BEFORE UPDATE ON english_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_english_questions_updated_at
    BEFORE UPDATE ON english_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_english_user_progress_updated_at
    BEFORE UPDATE ON english_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_english_reviews_updated_at
    BEFORE UPDATE ON english_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Core user information from Firebase authentication';
COMMENT ON TABLE addresses IS 'User addresses - supports multiple addresses per user';

COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID - unique identifier';
COMMENT ON COLUMN users.email IS 'User email from Firebase Auth';
COMMENT ON COLUMN users.full_name IS 'User full name';
COMMENT ON COLUMN users.birth_date IS 'User date of birth';
COMMENT ON COLUMN users.phone IS 'Primary contact phone number';
COMMENT ON COLUMN users.preferred_language IS 'User preferred language code (e.g., pt-BR, en-US)';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag - false means user is deactivated';

COMMENT ON COLUMN addresses.address_type IS 'Type of address: primary, billing, shipping, other';
COMMENT ON COLUMN addresses.is_primary IS 'Flag indicating if this is the user primary address';
COMMENT ON COLUMN addresses.country IS 'Country name';
COMMENT ON COLUMN addresses.state IS 'State/Province name';

-- English Course tables comments
COMMENT ON TABLE english_lessons IS 'Lessons for English course using interactive method approach';
COMMENT ON TABLE english_questions IS 'Cards for each lesson - front/back style with English phrases and Portuguese translations';
COMMENT ON TABLE english_user_progress IS 'Tracks user progress through English lessons';
COMMENT ON TABLE english_reviews IS 'Spaced repetition review schedule for cards';
COMMENT ON TABLE english_answer_history IS 'Complete history of user answers for analytics';

COMMENT ON COLUMN english_lessons.lesson_number IS 'Sequential lesson number';
COMMENT ON COLUMN english_lessons.level IS 'Difficulty level: beginner, elementary, intermediate, advanced';
COMMENT ON COLUMN english_questions.front_text IS 'English phrase/sentence on the front of the card';
COMMENT ON COLUMN english_questions.back_text IS 'Portuguese translation on the back of the card';
COMMENT ON COLUMN english_user_progress.accuracy_percentage IS 'Percentage of correct answers';
COMMENT ON COLUMN english_reviews.ease_factor IS 'Spaced repetition ease factor (1.30-3.00)';
COMMENT ON COLUMN english_reviews.interval_days IS 'Days until next review';
COMMENT ON COLUMN english_reviews.is_due IS 'Flag indicating if review is currently due';

-- ============================================
-- DATABASE INITIALIZATION COMPLETE
-- ============================================

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'ScaleX database schema initialized successfully!';
    RAISE NOTICE 'To add sample data, run: english-course-sample-data-fixed.sql';
END $$;
