import pool from '../config/database';

export interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const toPublic = (row: UserRow): PublicUser => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findByEmail = async (email: string): Promise<UserRow | null> => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return res.rows[0] || null;
};

export const findById = async (id: string): Promise<UserRow | null> => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
};

export const createUser = async (params: {
  id: string;
  full_name?: string | null;
  email: string;
  password_hash: string;
  role?: string;
}): Promise<UserRow> => {
  const { id, full_name = null, email, password_hash, role = 'customer' } = params;
  const res = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, now(), now()) RETURNING *`,
    [id, full_name, email, password_hash, role]
  );
  return res.rows[0];
};

/**
 * Find an existing user by email, or create a new one for Firebase-authenticated users.
 * Firebase users don't have a password managed by our backend.
 */
export const findOrCreateFirebaseUser = async (params: {
  firebaseUid: string;
  email: string;
  displayName?: string | null;
}): Promise<UserRow> => {
  const { firebaseUid, email, displayName } = params;

  // Check if the user already exists by email
  const existing = await findByEmail(email.toLowerCase());
  if (existing) {
    return existing;
  }

  // Create a new user — use a crypto-random ID since Firebase UID may be long
  const crypto = require('crypto');
  const id = crypto.randomUUID();
  const randomHash = crypto.randomBytes(32).toString('hex');

  const res = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'customer', true, now(), now()) RETURNING *`,
    [id, displayName || null, email.toLowerCase(), randomHash]
  );
  return res.rows[0];
};
