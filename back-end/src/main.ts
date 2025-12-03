import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Set global prefix for all routes BEFORE static files
  app.setGlobalPrefix('api');

  // Enable CORS - Only allow front-end domain (private back-end architecture)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Add production frontend URL if configured
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    // Also allow www subdomain
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    if (!frontendUrl.hostname.startsWith('www.')) {
      allowedOrigins.push(`${frontendUrl.protocol}//www.${frontendUrl.hostname}`);
    }
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, like nginx proxy)
      // This is CRITICAL for the proxy reverso architecture
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-user-id'],
  });

  // Serve static files from public directory (for company logos)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });
  logger.log('📁 Static files served from /public');

  // Serve uploaded documents from uploads directory
  // __dirname in compiled code points to dist/src, so we need to go up two levels to reach project root
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads',
  });
  logger.log('📁 Static files served from /uploads');

  // Run migrations automatically on startup
  try {
    const dataSource = app.get(DataSource);
    const migrations = await dataSource.runMigrations();
    if (migrations.length > 0) {
      logger.log(`✅ ${migrations.length} migration(s) executed successfully`);
      migrations.forEach(migration => {
        logger.log(`  - ${migration.name}`);
      });
    } else {
      logger.log('✅ No pending migrations');
    }
  } catch (error) {
    logger.error('❌ Migration failed', error);
    throw error;
  }

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
