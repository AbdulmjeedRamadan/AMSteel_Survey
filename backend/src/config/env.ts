import dotenv from 'dotenv';
import path from 'path';
import type { StringValue } from 'ms';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;

  // Database
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: StringValue;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: StringValue;

  // Email (optional for now)
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  EMAIL_FROM?: string;

  // Frontend URL for CORS and links
  FRONTEND_URL: string;

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

/**
 * Validates and returns environment configuration
 * Throws error if required environment variables are missing
 */
function validateEnv(): EnvConfig {
  // Allow either DATABASE_URL (Neon) or individual DB vars (local PostgreSQL)
  const hasNeonUrl = !!process.env.DATABASE_URL;
  const hasLocalConfig = !!(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);

  if (!hasNeonUrl && !hasLocalConfig) {
    throw new Error(
      'Missing database configuration. Provide either:\n' +
      '1. DATABASE_URL (for Neon Serverless), or\n' +
      '2. DB_HOST, DB_NAME, DB_USER, DB_PASSWORD (for local PostgreSQL)\n' +
      'Please check your .env file.'
    );
  }

  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FRONTEND_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }

  // Build database configuration
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbName = process.env.DB_NAME || 'amsteel_survey';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';

  const databaseUrl = process.env.DATABASE_URL ||
    `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),

    // Database
    database: {
      url: databaseUrl,
      host: dbHost,
      port: dbPort,
      name: dbName,
      user: dbUser,
      password: dbPassword,
    },

    // JWT
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '1d') as StringValue,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_REFRESH_EXPIRES_IN: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as StringValue,

    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,

    // Frontend URL
    FRONTEND_URL: process.env.FRONTEND_URL!,

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  };
}

export const config = validateEnv();

export default config;
