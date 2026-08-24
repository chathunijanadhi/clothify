-- Migration: create users table

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone VARCHAR(30),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
