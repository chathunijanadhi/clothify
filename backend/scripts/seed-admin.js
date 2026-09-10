'use strict';

const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Chathuni Jayaweera';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in backend/.env.');
}

function getDatabaseConfig() {
  const connectionString = process.env.HostDatabase || process.env.DATABASE_URL;
  if (connectionString) {
    return {
      connectionString,
      ssl: !/localhost|127\.0\.0\.1/i.test(connectionString),
    };
  }

  const required = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing database configuration: ${missing.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };
}

async function seedAdmin() {
  const pool = new Pool(getDatabaseConfig());
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'admin', true, now(), now())
       ON CONFLICT (email)
       DO UPDATE SET full_name = EXCLUDED.full_name,
                     password_hash = EXCLUDED.password_hash,
                     role = 'admin',
                     is_active = true,
                     updated_at = now()
       RETURNING id, email, role, is_active`,
      [id, ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );

    console.log('Admin seed complete:', result.rows[0]);
  } finally {
    await pool.end();
  }
}

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error.message || error);
  process.exitCode = 1;
});
