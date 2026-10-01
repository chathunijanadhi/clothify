import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config({ quiet: true });

function positiveIntegerFromEnv(name: string, fallback: number): number {
  const configured = process.env[name];
  if (configured === undefined || configured === '') return fallback;

  const value = Number(configured);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

const databaseUrl = process.env.HostDatabase || process.env.DATABASE_URL;
const hasDatabaseUrl = Boolean(databaseUrl);
const legacyDatabaseVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
const missingEnvVars = hasDatabaseUrl
  ? []
  : legacyDatabaseVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing database configuration. Set DATABASE_URL for Neon or all of ${legacyDatabaseVars.join(', ')}.`
  );
}

export const pool = new Pool({
  ...(hasDatabaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: databaseUrl && !/localhost|127\.0\.0\.1/i.test(databaseUrl) ? true : false,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }),
  max: positiveIntegerFromEnv('DB_POOL_MAX', 10),
  idleTimeoutMillis: positiveIntegerFromEnv('DB_IDLE_TIMEOUT_MS', 30000),
  connectionTimeoutMillis: positiveIntegerFromEnv('DB_CONNECTION_TIMEOUT_MS', 5000),
  statement_timeout: positiveIntegerFromEnv('DB_STATEMENT_TIMEOUT_MS', 10000),
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function verifyDatabaseConnection(): Promise<void> {
  const maxAttempts = positiveIntegerFromEnv('DB_CONNECT_MAX_ATTEMPTS', 5);
  const retryBaseDelay = positiveIntegerFromEnv('DB_CONNECT_RETRY_BASE_DELAY_MS', 500);
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      logger.info({ attempt, maxAttempts }, 'Initial PostgreSQL connection established');
      return;
    } catch (err) {
      lastError = err;
      logger.warn({ err, attempt, maxAttempts }, 'Initial PostgreSQL connection attempt failed');
      if (attempt < maxAttempts) {
        await delay(Math.min(retryBaseDelay * (2 ** (attempt - 1)), 30000));
      }
    }
  }

  logger.error({ err: lastError, maxAttempts }, 'Unable to establish initial PostgreSQL connection');
  throw new Error(`Unable to connect to PostgreSQL after ${maxAttempts} attempts.`);
}

export default pool;
