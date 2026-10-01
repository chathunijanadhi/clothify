'use strict';
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });
const logger = require('./logger');

function getDatabaseConfig() {
  const connectionString = process.env.HostDatabase || process.env.DATABASE_URL;
  if (connectionString) {
    return {
      connectionString,
      ssl: !/localhost|127\.0\.0\.1/i.test(connectionString),
    };
  }

  const missing = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE']
    .filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required database environment variables: ${missing.join(', ')}. Check backend/.env.`);
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };
}

function extractCreateTableNames(sql) {
  // crude regex to find CREATE TABLE statements and capture table names
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?([a-zA-Z0-9_]+)"?)\s*\(/ig;
  const names = new Set();
  let m;
  while ((m = re.exec(sql)) !== null) {
    if (m[1]) names.add(m[1]);
  }
  return Array.from(names);
}

async function tableExists(pool, tableName) {
  const res = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
    [tableName]
  );
  return res.rows.length > 0;
}

async function ensureSchemaMigrations(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    migration TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);
}

async function getAppliedMigrations(pool) {
  const res = await pool.query('SELECT migration FROM schema_migrations ORDER BY migration ASC');
  return res.rows.map((r) => r.migration);
}

async function markMigrationApplied(client, migrationName) {
  await client.query('INSERT INTO schema_migrations (migration) VALUES ($1) ON CONFLICT (migration) DO NOTHING', [migrationName]);
}

async function run() {
  let pool;

  try {
    const config = getDatabaseConfig();
    pool = new Pool(config);
    const connection = await pool.connect();
    connection.release();
    logger.info('Connected to PostgreSQL database');

    const migrationsDir = path.resolve(__dirname, '..', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    logger.info({ migrations: files }, 'Migrations detected');

    if (files.length === 0) {
      logger.info({ migrationsDir }, 'No migration files found');
      return;
    }

    // Ensure schema_migrations exists
    await ensureSchemaMigrations(pool);
    const applied = await getAppliedMigrations(pool);
    logger.info({ migrations: applied }, 'Migrations already recorded');

    const skipped = [];
    const appliedNow = [];

    for (const file of files) {
      if (applied.includes(file)) {
        logger.info({ migration: file }, 'Skipping already-applied migration');
        skipped.push(file);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Check if migration appears to only create tables that already exist — if so, don't execute, just record
      const createTables = extractCreateTableNames(sql);
      let allExist = true;
      for (const t of createTables) {
        // check current DB
        const exists = await tableExists(pool, t);
        if (!exists) {
          allExist = false;
          break;
        }
      }

      if (createTables.length > 0 && allExist) {
        // safest path: mark as applied without running SQL
        logger.info({ migration: file, tables: createTables }, 'Migration tables already exist; recording without execution');
        await pool.query('INSERT INTO schema_migrations (migration) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
        skipped.push(file);
        continue;
      }

      // Otherwise run migration in transaction and record on success
      const client = await pool.connect();
      try {
        logger.info({ migration: file }, 'Applying migration');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        await markMigrationApplied(client, file);
        logger.info({ migration: file }, 'Migration applied and recorded');
        appliedNow.push(file);
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ err, migration: file }, 'Failed to apply migration');
        throw err;
      } finally {
        client.release();
      }
    }

    const finalApplied = await getAppliedMigrations(pool);

    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    logger.info({ tables: res.rows.map((row) => row.table_name) }, 'Public tables');
    logger.info({
      detected: files.length,
      previouslyRecorded: applied.length,
      executedNow: appliedNow,
      skipped: skipped,
      totalRecorded: finalApplied.length,
    }, 'Migration summary');
    logger.info('Migrations complete');
  } catch (err) {
    logger.error({ err }, 'Migration run failed');
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

run();
