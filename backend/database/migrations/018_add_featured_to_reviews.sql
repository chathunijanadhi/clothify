-- Allow product_id to be nullable
ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) DEFAULT 'product';

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product_unique ON reviews (user_id, product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews (is_featured);
