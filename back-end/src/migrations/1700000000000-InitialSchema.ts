import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
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

        CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
        CONSTRAINT check_birth_date CHECK (birth_date <= CURRENT_DATE),
        CONSTRAINT check_phone_format CHECK (phone ~* '^[\\d\\s\\-\\+\\(\\)]+$')
      )
    `);

    // Create addresses table
    await queryRunner.query(`
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

        CONSTRAINT check_address_type CHECK (address_type IN ('primary', 'billing', 'shipping', 'other'))
      )
    `);

    // Create indexes for users
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`,
    );

    // Create indexes for addresses
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_addresses_is_primary ON addresses(is_primary)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_addresses_postal_code ON addresses(postal_code)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_addresses_country ON addresses(country)`,
    );

    // Create function to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_addresses_updated_at
        BEFORE UPDATE ON addresses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Create function to ensure only one primary address per user
    await queryRunner.query(`
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
      $$ language 'plpgsql'
    `);

    await queryRunner.query(`
      CREATE TRIGGER ensure_one_primary_address_trigger
        BEFORE INSERT OR UPDATE ON addresses
        FOR EACH ROW
        EXECUTE FUNCTION ensure_one_primary_address()
    `);

    // Add comments for documentation
    await queryRunner.query(
      `COMMENT ON TABLE users IS 'Core user information from Firebase authentication'`,
    );
    await queryRunner.query(
      `COMMENT ON TABLE addresses IS 'User addresses - supports multiple addresses per user'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.firebase_uid IS 'Firebase Authentication UID - unique identifier'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.email IS 'User email from Firebase Auth'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.full_name IS 'User full name'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.birth_date IS 'User date of birth'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.phone IS 'Primary contact phone number'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.preferred_language IS 'User preferred language code (e.g., pt-BR, en-US)'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN users.is_active IS 'Soft delete flag - false means user is deactivated'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN addresses.address_type IS 'Type of address: primary, billing, shipping, other'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN addresses.is_primary IS 'Flag indicating if this is the user primary address'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN addresses.country IS 'Country name'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN addresses.state IS 'State/Province name'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS ensure_one_primary_address_trigger ON addresses`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
    );

    // Drop functions
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS ensure_one_primary_address()`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_addresses_country`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_addresses_postal_code`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_addresses_is_primary`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_addresses_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_firebase_uid`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS addresses CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);

    // Drop extension (optional - be careful with this in shared databases)
    // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
