import crypto from 'crypto';
import pool from '../config/database';

export interface ReviewItem {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  reviewText: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userInitials?: string;
}

export const getReviewsByProduct = async (productId: string): Promise<ReviewItem[]> => {
  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.is_verified,
           r.created_at, r.updated_at,
           u.full_name, u.email
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query, [productId]);
  return result.rows.map((row) => {
    const fullName = String(row.full_name || '').trim() || 'Verified Shopper';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'VS';
    return {
      id: row.id,
      userId: row.user_id,
      productId: row.product_id,
      rating: Number(row.rating),
      reviewText: row.review_text,
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userName: fullName,
      userInitials: initials.toUpperCase(),
    };
  });
};

export const getFeaturedReviews = async (limit = 6): Promise<any[]> => {
  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.review_text, r.is_verified,
           r.created_at, r.updated_at,
           u.full_name, u.email,
           p.name AS product_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN products p ON p.id = r.product_id
    WHERE r.rating >= 4
    ORDER BY r.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows.map((row) => {
    const fullName = String(row.full_name || '').trim() || 'Verified Shopper';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'VS';
    return {
      id: row.id,
      name: fullName,
      location: 'Sri Lanka',
      rating: Number(row.rating),
      title: Number(row.rating) === 5 ? 'Flawless tailoring & premium fabric' : 'Great quality & fit',
      comment: row.review_text || 'Exceptional craftsmanship and comfortable fit. Exceeded expectations!',
      itemPurchased: row.product_name || 'Clothify Signature Piece',
      avatar: initials,
      verified: Boolean(row.is_verified),
    };
  });
};

export const getUserReview = async (userId: string, productId: string) => {
  const res = await pool.query(
    'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2 LIMIT 1',
    [userId, productId]
  );
  const review = res.rows[0] || null;

  // Check if user has purchased this product
  const purchaseRes = await pool.query(
    `SELECT oi.id, o.status, o.payment_status
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1 AND oi.product_id = $2
     LIMIT 1`,
    [userId, productId]
  );
  const hasPurchased = purchaseRes.rows.length > 0;

  return {
    review,
    hasPurchased,
  };
};

export const createOrUpdateReview = async (payload: {
  userId: string;
  productId: string;
  rating: number;
  reviewText?: string | null;
}) => {
  const { userId, productId, rating, reviewText } = payload;

  const validRating = Math.min(5, Math.max(1, Math.round(Number(rating))));

  // Check if user has purchased this product
  const purchaseRes = await pool.query(
    `SELECT oi.id
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.user_id = $1 AND oi.product_id = $2
     LIMIT 1`,
    [userId, productId]
  );
  const isVerified = purchaseRes.rows.length > 0;

  const reviewId = crypto.randomUUID();

  const insertQuery = `
    INSERT INTO reviews (id, user_id, product_id, rating, review_text, is_verified, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET rating = EXCLUDED.rating,
                  review_text = EXCLUDED.review_text,
                  is_verified = EXCLUDED.is_verified,
                  updated_at = NOW()
    RETURNING *
  `;

  const reviewRes = await pool.query(insertQuery, [
    reviewId,
    userId,
    productId,
    validRating,
    reviewText?.trim() || null,
    isVerified,
  ]);

  // Recalculate and update the product's average rating and review_count
  await pool.query(
    `UPDATE products
     SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1), 4.8),
         review_count = (SELECT COUNT(*)::int FROM reviews WHERE product_id = $1),
         updated_at = NOW()
     WHERE id = $1`,
    [productId]
  );

  return reviewRes.rows[0];
};
