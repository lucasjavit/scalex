import { config } from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables
config();

// Helper function to get required environment variable
const getRequiredEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}. Please set it in your .env file or environment.`,
    );
  }
  return value;
};

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getRequiredEnv('DB_HOST'),
  port: parseInt(getRequiredEnv('DB_PORT', '5432')),
  username: getRequiredEnv('DB_USERNAME'),
  password: getRequiredEnv('DB_PASSWORD'),
  database: getRequiredEnv('DB_DATABASE'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // IMPORTANT: Set to false in production, use migrations instead
  logging: process.env.NODE_ENV === 'development',
});
