import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
});

export default pool;
