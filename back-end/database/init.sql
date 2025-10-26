-- ScaleX Database Schema
-- Simplified structure with string values

-- Create database (if running as superuser)
-- Note: This will be skipped if database already exists or user doesn't have permissions
DROP DATABASE IF EXISTS scalex;
CREATE DATABASE scalex;

-- Connect to the database
\c scalex

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

-- ============================================
-- DATABASE INITIALIZATION COMPLETE
-- ============================================

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'ScaleX database schema initialized successfully!';
END $$;
