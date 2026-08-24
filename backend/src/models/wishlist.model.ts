import crypto from 'crypto';
import pool from '../config/database';

export interface WishlistItemRow {
  id: string;
  wishlist_id: string;
  product_id: string;
  created_at: Date;
  product_name?: string;
  product_image?: string | null;
  price?: string;
  final_price?: string;
  rating?: string;
}

export interface WishlistSummary {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  items: WishlistItemRow[];
}

export const getWishlistByUserId = async (userId: string): Promise<WishlistSummary> => {
  let wishlist = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 LIMIT 1', [userId]);

  if (!wishlist.rows[0]) {
    const created = await pool.query(
      'INSERT INTO wishlists (id, user_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [crypto.randomUUID(), userId]
    );
    wishlist = { rows: created.rows } as any;
  }

  const wishlistRow = wishlist.rows[0];
  const itemsRes = await pool.query(
    `SELECT
      wi.id,
      wi.wishlist_id,
      wi.product_id,
      wi.created_at,
      p.name AS product_name,
      p.price,
      p.final_price,
      p.rating,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = wi.product_id AND pi.is_primary = true
        ORDER BY pi.created_at ASC
        LIMIT 1
      ) AS product_image
    FROM wishlist_items wi
    INNER JOIN products p ON p.id = wi.product_id
    WHERE wi.wishlist_id = $1
    ORDER BY wi.created_at DESC`,
    [wishlistRow.id]
  );

  return {
    ...wishlistRow,
    items: itemsRes.rows as WishlistItemRow[],
  };
};

export const addItemToWishlist = async (userId: string, productId: string): Promise<WishlistSummary> => {
  const wishlist = await getWishlistByUserId(userId);

  const productRes = await pool.query('SELECT id FROM products WHERE id = $1 AND is_active = true LIMIT 1', [productId]);
  if (!productRes.rows[0]) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  const existingRes = await pool.query(
    'SELECT * FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2 LIMIT 1',
    [wishlist.id, productId]
  );

  if (!existingRes.rows[0]) {
    await pool.query(
      'INSERT INTO wishlist_items (id, wishlist_id, product_id, created_at) VALUES ($1, $2, $3, NOW())',
      [crypto.randomUUID(), wishlist.id, productId]
    );
  }

  return getWishlistByUserId(userId);
};

export const removeItemFromWishlist = async (userId: string, productId: string): Promise<WishlistSummary> => {
  const wishlist = await getWishlistByUserId(userId);
  await pool.query('DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2', [wishlist.id, productId]);
  return getWishlistByUserId(userId);
};
