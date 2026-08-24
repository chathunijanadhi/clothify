import crypto from 'crypto';
import pool from '../config/database';

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
  brand?: string | null;
  price: number;
  discountPercentage?: number;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  isActive?: boolean;
}): Promise<ProductRow> => {
  const categoryId = payload.categoryId || (payload.categoryName ? (await findCategoryByName(payload.categoryName))?.id : null);
  if (!categoryId) throw new Error('CATEGORY_NOT_FOUND');

  const name = payload.name.trim();
  const price = Number(payload.price);
  const discountPercentage = Number(payload.discountPercentage ?? 0);
  const stockQuantity = Number(payload.stockQuantity ?? 0);
  const finalPrice = Number((price * (1 - discountPercentage / 100)).toFixed(2));
  const productId = payload.id || crypto.randomUUID();
  const slug = slugify(name);

  const productRes = await pool.query(
    `INSERT INTO products (
      id, category_id, name, slug, description, brand, price, discount_percentage,
      final_price, stock_quantity, rating, review_count, is_active, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, 0, $11, NOW(), NOW()) RETURNING *`,
    [productId, categoryId, name, slug, payload.description ?? null, payload.brand ?? null, price, discountPercentage, finalPrice, stockQuantity, payload.isActive ?? true]
  );

  const created = productRes.rows[0];

  await insertProductImages(productId, payload.images ?? []);
  await insertProductVariants(productId, payload.sizes ?? [], payload.colors ?? [], stockQuantity, slug);

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
  isActive?: boolean;
}): Promise<ProductRow | null> => {
  const existing = await getProductById(id);
  if (!existing) return null;

  const categoryId = payload.categoryId || (payload.categoryName ? (await findCategoryByName(payload.categoryName))?.id : existing.category_id);
  const name = payload.name?.trim() || existing.name;
  const description = payload.description ?? existing.description;
  const brand = payload.brand ?? existing.brand;
  const price = Number(payload.price ?? existing.price);
  const discountPercentage = Number(payload.discountPercentage ?? existing.discount_percentage);
  const stockQuantity = Number(payload.stockQuantity ?? existing.stock_quantity);
  const finalPrice = Number((price * (1 - discountPercentage / 100)).toFixed(2));
  const isActive = payload.isActive ?? existing.is_active;

  const res = await pool.query(
    `UPDATE products
     SET category_id = $1, name = $2, slug = $3, description = $4, brand = $5, price = $6,
         discount_percentage = $7, final_price = $8, stock_quantity = $9, is_active = $10, updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [categoryId, name, slugify(name), description, brand, price, discountPercentage, finalPrice, stockQuantity, isActive, id]
  );

  if (payload.images !== undefined) {
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await insertProductImages(id, payload.images ?? []);
  }

  if (payload.sizes !== undefined || payload.colors !== undefined) {
    await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    await insertProductVariants(id, payload.sizes ?? [], payload.colors ?? [], stockQuantity, slugify(name));
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
  sizes: string[],
  colors: string[],
  stockQuantity: number,
  slug: string
): Promise<void> {
  const sizeList = sizes.length > 0 ? sizes : ['N/A'];
  const colorList = colors.length > 0 ? colors : ['N/A'];

  for (const size of sizeList) {
    for (const color of colorList) {
      await pool.query(
        `INSERT INTO product_variants (id, product_id, size, color, sku, stock_quantity, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         ON CONFLICT (product_id, size, color) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity, updated_at = NOW()`,
        [crypto.randomUUID(), productId, size, color, `${slug}-${size}-${color}`.toUpperCase(), stockQuantity]
      );
    }
  }
}

function buildWhereClause(filters: Record<string, unknown>) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    const value = `%${String(filters.search).trim()}%`;
    params.push(value);
    clauses.push(`(LOWER(p.name) ILIKE $${params.length} OR LOWER(p.brand) ILIKE $${params.length} OR LOWER(c.name) ILIKE $${params.length})`);
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}
