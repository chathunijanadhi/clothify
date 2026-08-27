import crypto from 'crypto';
import pool from '../config/database';

// Ensure database schema compatibility: create 'segment' column if it's missing.
// This makes upgrading the running app simpler without requiring a manual migration step.
(async () => {
  try {
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS segment TEXT");
  } catch (err) {
    // Log but don't fail startup — operations can proceed and errors will surface on queries.
    console.error('Warning: failed to ensure products.segment column exists', err?.message || err);
  }
})();

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductRow {
  id: string;
  category_id: string;
  // new: primary audience/segment (e.g., Men, Women, Kids)
  segment?: string | null;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  price: string;
  discount_percentage: string;
  final_price: string;
  stock_quantity: number;
  rating: string;
  review_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  category_name?: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  created_at: Date;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductVariantInput {
  size: string;
  color: string;
  stockQuantity: number;
}

export const listCategories = async (): Promise<CategoryRow[]> => {
  const res = await pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY name ASC');
  return res.rows;
};

export const findCategoryById = async (id: string): Promise<CategoryRow | null> => {
  const res = await pool.query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
};

export const findCategoryByName = async (name: string): Promise<CategoryRow | null> => {
  const res = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]);
  return res.rows[0] || null;
};

export const countProducts = async (filters: Record<string, unknown>): Promise<number> => {
  const { whereClause, params } = buildWhereClause(filters);
  const query = `SELECT COUNT(*)::int AS total FROM products p ${whereClause}`.trim();
  const res = await pool.query(query, params);
  return Number(res.rows[0]?.total ?? 0);
};

export const listProducts = async (filters: Record<string, unknown>, page = 1, limit = 10): Promise<ProductRow[]> => {
  const { whereClause, params } = buildWhereClause(filters);
  const offset = (page - 1) * limit;
  const query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    ${whereClause}
    ORDER BY ${resolveSort(filters.sort as string | undefined)}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const res = await pool.query(query, [...params, limit, offset]);
  return res.rows;
};

export const getProductById = async (id: string): Promise<ProductRow | null> => {
  const res = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
};

export const listProductImages = async (productIds: string[]): Promise<ProductImageRow[]> => {
  if (!productIds.length) return [];
  const res = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ANY($1) ORDER BY is_primary DESC, created_at ASC',
    [productIds]
  );
  return res.rows;
};

export const listProductVariants = async (productIds: string[]): Promise<ProductVariantRow[]> => {
  if (!productIds.length) return [];
  const res = await pool.query(
    'SELECT * FROM product_variants WHERE product_id = ANY($1) ORDER BY size ASC, color ASC',
    [productIds]
  );
  return res.rows;
};

export const createProduct = async (payload: {
  id?: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  // new: primary audience/segment (Men, Women, Kids)
  segment?: string | null;
  brand?: string | null;
  price: number;
  discountPercentage?: number;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  variants?: Array<{ size?: string; color?: string; stockQuantity?: number; colors?: Array<{ color?: string; stockQuantity?: number; stock?: number }> }>;
  isActive?: boolean;
}): Promise<ProductRow> => {
  let categoryId = payload.categoryId ?? null;
  if (!categoryId && payload.categoryName) {
    const found = await findCategoryByName(payload.categoryName);
    if (found) {
      categoryId = found.id;
    } else {
      // create category on the fly when admin supplies a category name that doesn't exist
      const newCatId = crypto.randomUUID();
      const catSlug = slugify(String(payload.categoryName));
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, NULL, true, NOW(), NOW())',
        [newCatId, payload.categoryName, catSlug]
      );
      categoryId = newCatId;
    }
  }
  if (!categoryId) throw new Error('CATEGORY_NOT_FOUND');

  const name = payload.name.trim();
  const price = Number(payload.price);
  const discountPercentage = 0;
  const normalizedVariants = normalizeVariantEntries(payload.variants, payload.sizes ?? [], payload.colors ?? []);
  const stockQuantity = Number(payload.stockQuantity ?? 0);
  const totalVariantStock = normalizedVariants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0);
  const finalStock = normalizedVariants.length > 0 ? totalVariantStock : stockQuantity;
  const finalPrice = Number(price.toFixed(2));
  const productId = payload.id || crypto.randomUUID();
  const slug = await ensureUniqueProductSlug(name, productId);
    const segment = payload.segment ?? null;

    const productRes = await pool.query(
      `INSERT INTO products (
        id, category_id, segment, name, slug, description, brand, price, discount_percentage,
        final_price, stock_quantity, rating, review_count, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 0, $12, NOW(), NOW()) RETURNING *`,
      [productId, categoryId, segment, name, slug, payload.description ?? null, payload.brand ?? null, price, discountPercentage, finalPrice, finalStock, payload.isActive ?? true]
    );

  const created = productRes.rows[0];

  await insertProductImages(productId, payload.images ?? []);
  await insertProductVariants(productId, normalizedVariants, slug);
  const recalculatedStock = await recalculateProductStock(productId);
  created.stock_quantity = recalculatedStock;

  return created;
};

export const updateProduct = async (id: string, payload: {
  name?: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  brand?: string | null;
  price?: number;
  discountPercentage?: number;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  variants?: Array<{ size?: string; color?: string; stockQuantity?: number; colors?: Array<{ color?: string; stockQuantity?: number; stock?: number }> }>;
  isActive?: boolean;
}): Promise<ProductRow | null> => {
  const existing = await getProductById(id);
  if (!existing) return null;

  let categoryId = payload.categoryId ?? null;
  if (!categoryId && payload.categoryName) {
    const found = await findCategoryByName(payload.categoryName);
    if (found) {
      categoryId = found.id;
    } else {
      const newCatId = crypto.randomUUID();
      const catSlug = slugify(String(payload.categoryName));
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, NULL, true, NOW(), NOW())',
        [newCatId, payload.categoryName, catSlug]
      );
      categoryId = newCatId;
    }
  }
  if (!categoryId) {
    categoryId = existing.category_id;
  }
  const name = payload.name?.trim() || existing.name;
  const description = payload.description ?? existing.description;
  const brand = payload.brand ?? existing.brand;
  const price = Number(payload.price ?? existing.price);
  const discountPercentage = 0;
  const normalizedVariants = payload.variants !== undefined ? normalizeVariantEntries(payload.variants, payload.sizes ?? [], payload.colors ?? []) : undefined;
  const stockQuantity = Number(payload.stockQuantity ?? existing.stock_quantity);
  const finalStock = normalizedVariants && normalizedVariants.length > 0 ? normalizedVariants.reduce((sum, variant) => sum + Number(variant.stockQuantity || 0), 0) : stockQuantity;
  const finalPrice = Number(price.toFixed(2));
  const isActive = payload.isActive ?? existing.is_active;
  const nextSlug = await ensureUniqueProductSlug(name, id);

  const res = await pool.query(
    `UPDATE products
     SET category_id = $1, segment = $2, name = $3, slug = $4, description = $5, brand = $6, price = $7,
         discount_percentage = $8, final_price = $9, stock_quantity = $10, is_active = $11, updated_at = NOW()
     WHERE id = $12
     RETURNING *`,
    [categoryId, payload.segment ?? null, name, nextSlug, description, brand, price, discountPercentage, finalPrice, finalStock, isActive, id]
  );

  if (payload.images !== undefined) {
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await insertProductImages(id, payload.images ?? []);
  }

  if (normalizedVariants !== undefined) {
    await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    await insertProductVariants(id, normalizedVariants, nextSlug);
    const recalculatedStock = await recalculateProductStock(id);
    if (res.rows[0]) {
      res.rows[0].stock_quantity = recalculatedStock;
    }
  } else if (payload.sizes !== undefined || payload.colors !== undefined) {
    await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    await insertProductVariants(id, normalizeVariantEntries([], payload.sizes ?? [], payload.colors ?? []), nextSlug);
    const recalculatedStock = await recalculateProductStock(id);
    if (res.rows[0]) {
      res.rows[0].stock_quantity = recalculatedStock;
    }
  }

  return res.rows[0] || null;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
};

async function insertProductImages(productId: string, imageUrls: string[]): Promise<void> {
  if (!imageUrls.length) return;

  const values = imageUrls.map((imageUrl, index) => [crypto.randomUUID(), productId, imageUrl, index === 0]);
  for (const [imageId, currentProductId, url, primary] of values) {
    await pool.query(
      'INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary) VALUES ($1, $2, $3, NULL, $4)',
      [imageId, currentProductId, url, primary]
    );
  }
}

async function insertProductVariants(
  productId: string,
  variants: ProductVariantInput[] | string[],
  slug: string,
  stockQuantity?: number
): Promise<void> {
  const flatVariants = Array.isArray(variants) && variants.length > 0 && typeof variants[0] === 'object'
    ? (variants as ProductVariantInput[])
    : (() => {
        const sizeList = (variants as string[]).length > 0 ? (variants as string[]) : ['N/A'];
        const colorList = stockQuantity !== undefined ? ['N/A'] : ['N/A'];
        return [{ size: sizeList[0], color: colorList[0], stockQuantity: stockQuantity ?? 0 }];
      })();

  const normalizedEntries = flatVariants.filter((variant) => !!variant && typeof variant === 'object' && String(variant.size ?? '').trim() && String(variant.color ?? '').trim());

  if (!normalizedEntries.length) return;

  for (const variant of normalizedEntries) {
    const size = String(variant.size).trim();
    const color = String(variant.color).trim();
    const variantQty = Number(variant.stockQuantity ?? 0);
    await pool.query(
      `INSERT INTO product_variants (id, product_id, size, color, sku, stock_quantity, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (product_id, size, color) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity, updated_at = NOW()`,
      [crypto.randomUUID(), productId, size, color, `${slug}-${size}-${color}`.toUpperCase(), variantQty]
    );
  }
}

function normalizeVariantEntries(
  variantEntries?: Array<{ size?: string; color?: string; stockQuantity?: number; stock?: number; colors?: Array<{ color?: string; stockQuantity?: number; stock?: number }> }>,
  sizeList: string[] = [],
  colorList: string[] = []
): ProductVariantInput[] {
  const entries: ProductVariantInput[] = [];
  const normalizedVariantEntries = Array.isArray(variantEntries) ? variantEntries : [];

  for (const item of normalizedVariantEntries) {
    if (!item || typeof item !== 'object') continue;

    if (Array.isArray(item.colors) && item.colors.length) {
      const size = String(item.size ?? '').trim();
      if (!size) continue;
      for (const colorEntry of item.colors) {
        const color = String(colorEntry?.color ?? '').trim();
        if (!color) continue;
        entries.push({
         size,
         color,
         stockQuantity: Number(colorEntry?.stockQuantity ?? colorEntry?.stock ?? 0),
        });
      }
      continue;
    }

    const size = String(item.size ?? '').trim();
    const color = String(item.color ?? '').trim();
    if (!size || !color) continue;
    entries.push({
      size,
      color,
      stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),
    });
  }

  const fallbackSizes = sizeList.filter((size) => String(size).trim());
  const fallbackColors = colorList.filter((color) => String(color).trim());
  if (entries.length === 0 && fallbackSizes.length && fallbackColors.length) {
    for (const size of fallbackSizes) {
      for (const color of fallbackColors) {
        entries.push({ size, color, stockQuantity: 0 });
      }
    }
  }

  return entries.filter((entry, index, array) => {
    const key = `${entry.size}::${entry.color}`.toLowerCase();
    return array.findIndex((candidate) => `${candidate.size}::${candidate.color}`.toLowerCase() === key) === index;
  });
}

function buildWhereClause(filters: Record<string, unknown>) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    const value = `%${String(filters.search).trim()}%`;
    params.push(value);
    clauses.push(`(LOWER(p.name) ILIKE $${params.length} OR LOWER(p.brand) ILIKE $${params.length} OR LOWER(c.name) ILIKE $${params.length})`);
  }

  if (filters.segment) {
    params.push(String(filters.segment));
    clauses.push(`LOWER(p.segment) = LOWER($${params.length})`);
  }

  if (filters.category) {
    params.push(String(filters.category));
    clauses.push(`LOWER(c.name) = LOWER($${params.length})`);
  }

  if (filters.brand) {
    params.push(String(filters.brand));
    clauses.push(`LOWER(p.brand) = LOWER($${params.length})`);
  }

  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    params.push(Number(filters.minPrice));
    clauses.push(`p.final_price >= $${params.length}`);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    params.push(Number(filters.maxPrice));
    clauses.push(`p.final_price <= $${params.length}`);
  }

  if (filters.size) {
    params.push(String(filters.size));
    clauses.push(`EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND LOWER(pv.size) = LOWER($${params.length}))`);
  }

  if (filters.color) {
    params.push(String(filters.color));
    clauses.push(`EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND LOWER(pv.color) = LOWER($${params.length}))`);
  }

  if (filters.rating !== undefined && filters.rating !== '') {
    params.push(Number(filters.rating));
    clauses.push(`p.rating >= $${params.length}`);
  }

  if (filters.inStock === 'true' || filters.inStock === true) {
    clauses.push('p.stock_quantity > 0');
  }

  clauses.push('p.is_active = true');

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereClause, params };
}

function resolveSort(sort?: string): string {
  switch (sort) {
    case 'price_asc':
      return 'p.final_price ASC';
    case 'price_desc':
      return 'p.final_price DESC';
    case 'rating_desc':
      return 'p.rating DESC, p.review_count DESC';
    case 'popular':
      return 'p.review_count DESC, p.rating DESC';
    case 'discount_desc':
      return 'p.discount_percentage DESC';
    case 'newest':
    default:
      return 'p.created_at DESC';
  }
}

async function ensureUniqueProductSlug(name: string, excludeProductId?: string): Promise<string> {
  const baseName = slugify(name) || 'product';
  let candidate = baseName.slice(0, 200);
  let suffix = 1;

  while (true) {
    const result = await pool.query(
      'SELECT id FROM products WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2) LIMIT 1',
      [candidate, excludeProductId ?? null]
    );

    if (!result.rows[0]) return candidate;

    candidate = `${baseName.slice(0, 190)}-${suffix}`;
    suffix += 1;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

async function recalculateProductStock(productId: string): Promise<number> {
  const res = await pool.query(
    'SELECT COALESCE(SUM(stock_quantity), 0)::int AS total FROM product_variants WHERE product_id = $1',
    [productId]
  );
  const total = Number(res.rows[0]?.total ?? 0);
  await pool.query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [total, productId]);
  return total;
}
