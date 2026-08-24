CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO categories (id, name, slug, description, is_active, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Men', 'men', 'Men clothing collection', TRUE, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Women', 'women', 'Women clothing collection', TRUE, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Kids', 'kids', 'Kids clothing collection', TRUE, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Dresses', 'dresses', 'Dresses collection', TRUE, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'Shirts', 'shirts', 'Shirts collection', TRUE, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', 'T-Shirts', 't-shirts', 'T-Shirts collection', TRUE, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'Jeans', 'jeans', 'Jeans collection', TRUE, NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'Trousers', 'trousers', 'Trousers collection', TRUE, NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'Jackets', 'jackets', 'Jackets collection', TRUE, NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Shoes', 'shoes', 'Shoes collection', TRUE, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Accessories', 'accessories', 'Accessories collection', TRUE, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
