import crypto from 'crypto';
import pool from '../config/database';

export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_time: string;
  created_at: Date;
  updated_at: Date;
  product_name?: string;
  product_image?: string | null;
  variant_size?: string | null;
  variant_color?: string | null;
  final_price?: string;
}

export interface CartSummary {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  items: CartItemRow[];
  totalItems: number;
  subtotal: number;
}

export const getCartByUserId = async (userId: string): Promise<CartSummary> => {
  let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1 LIMIT 1', [userId]);

  if (!cart.rows[0]) {
    const created = await pool.query(
      'INSERT INTO carts (id, user_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [crypto.randomUUID(), userId]
    );
    cart = { rows: created.rows } as any;
  }

  const cartRow = cart.rows[0];

  const itemsRes = await pool.query(
    `SELECT
      ci.id,
      ci.cart_id,
      ci.product_id,
      ci.variant_id,
      ci.quantity,
      ci.price_at_time,
      ci.created_at,
      ci.updated_at,
      p.name AS product_name,
      p.final_price,
      p.slug,
      pv.size AS variant_size,
      pv.color AS variant_color,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = ci.product_id AND pi.is_primary = true
        ORDER BY pi.created_at ASC
        LIMIT 1
      ) AS product_image
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC`,
    [cartRow.id]
  );

  const items = itemsRes.rows as CartItemRow[];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price_at_time || 0) * Number(item.quantity || 0), 0);

  return {
    ...cartRow,
    items,
    totalItems: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    subtotal,
  };
};

export const addItemToCart = async (userId: string, productId: string, quantity: number, variantId?: string | null): Promise<CartSummary> => {
  const cart = await getCartByUserId(userId);
  const normalizedQuantity = Number(quantity);

  if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  const productRes = await pool.query(
    'SELECT id, price, final_price, stock_quantity, is_active FROM products WHERE id = $1 LIMIT 1',
    [productId]
  );

  const product = productRes.rows[0];
  if (!product) throw new Error('PRODUCT_NOT_FOUND');
  if (!product.is_active) throw new Error('PRODUCT_INACTIVE');

  let availableStock = Number(product.stock_quantity || 0);

  if (variantId) {
    const variantRes = await pool.query(
      'SELECT id, stock_quantity, is_active FROM product_variants WHERE id = $1 AND product_id = $2 LIMIT 1',
      [variantId, productId]
    );
    const variant = variantRes.rows[0];
    if (!variant) throw new Error('VARIANT_NOT_FOUND');
    if (!variant.is_active) throw new Error('VARIANT_INACTIVE');
    availableStock = Number(variant.stock_quantity || 0);
  }

  const existingRes = await pool.query(
    `SELECT * FROM cart_items
     WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3
     LIMIT 1`,
    [cart.id, productId, variantId ?? null]
  );

  const existing = existingRes.rows[0];

  if (existing) {
    const nextQty = Number(existing.quantity) + normalizedQuantity;
    if (nextQty > availableStock) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [nextQty, existing.id]
    );
  } else {
    if (normalizedQuantity > availableStock) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    await pool.query(
      `INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, price_at_time, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [crypto.randomUUID(), cart.id, productId, variantId ?? null, normalizedQuantity, Number(product.final_price ?? product.price ?? 0)]
    );
  }

  return getCartByUserId(userId);
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number): Promise<CartSummary> => {
  const cart = await getCartByUserId(userId);
  const item = cart.items.find((row) => row.id === itemId);

  if (!item) {
    throw new Error('CART_ITEM_NOT_FOUND');
  }

  const nextQuantity = Number(quantity);
  if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cart.id]);
    return getCartByUserId(userId);
  }

  let availableStock = 0;
  const stockRes = await pool.query(
    `SELECT stock_quantity FROM products WHERE id = $1 LIMIT 1`,
    [item.product_id]
  );

  if (stockRes.rows[0]) {
    availableStock = Number(stockRes.rows[0].stock_quantity || 0);
  }

  if (item.variant_id) {
    const variantRes = await pool.query(
      'SELECT stock_quantity FROM product_variants WHERE id = $1 AND product_id = $2 LIMIT 1',
      [item.variant_id, item.product_id]
    );
    if (variantRes.rows[0]) {
      availableStock = Number(variantRes.rows[0].stock_quantity || 0);
    }
  }

  if (nextQuantity > availableStock) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  await pool.query(
    'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND cart_id = $3',
    [nextQuantity, itemId, cart.id]
  );

  return getCartByUserId(userId);
};

export const removeCartItem = async (userId: string, itemId: string): Promise<CartSummary> => {
  const cart = await getCartByUserId(userId);
  await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cart.id]);
  return getCartByUserId(userId);
};

export const clearCart = async (userId: string): Promise<CartSummary> => {
  const cart = await getCartByUserId(userId);
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  return getCartByUserId(userId);
};
