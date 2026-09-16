import crypto from 'crypto';
import pool from '../config/database';

// Ensure schema is updated for store feedback and home page featuring
(async () => {
  try {
    await pool.query(`
      ALTER TABLE reviews ALTER COLUMN product_id DROP NOT NULL;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS feedback_type VARCHAR(50) DEFAULT 'product';
      CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews (is_featured);
    `);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Reviews schema check notice:', msg);
  }
})();

export interface ReviewItem {
  id: string;
  userId: string;
  productId?: string | null;
  productName?: string | null;
  rating: number;
  title?: string | null;
  reviewText: string | null;
  comment?: string | null;
  feedbackType?: string;
  isVerified: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  name?: string;
  userEmail?: string;
  userInitials?: string;
  avatar?: string;
  location?: string;
}

export const getReviewsByProduct = async (productId: string): Promise<ReviewItem[]> => {
  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.title, r.review_text, r.is_verified,
           r.is_featured, r.created_at, r.updated_at,
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
      title: row.title,
      reviewText: row.review_text,
      comment: row.review_text,
      isVerified: Boolean(row.is_verified),
      isFeatured: Boolean(row.is_featured),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userName: fullName,
      name: fullName,
      userInitials: initials.toUpperCase(),
      avatar: initials.toUpperCase(),
    };
  });
};

export const getFeaturedReviews = async (limit = 3): Promise<any[]> => {
  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.title, r.review_text, r.feedback_type,
           r.is_verified, r.is_featured, r.created_at, r.updated_at,
           u.full_name, u.email,
           p.name AS product_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN products p ON p.id = r.product_id
    WHERE (r.is_featured = TRUE)
       OR (r.review_text IS NOT NULL AND LENGTH(TRIM(r.review_text)) > 0 AND r.rating >= 4)
    ORDER BY r.is_featured DESC, r.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [Math.min(3, Math.max(1, limit))]);
  return result.rows.map((row) => {
    const fullName = String(row.full_name || '').trim() || 'Verified Shopper';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'VS';
    const comment = row.review_text || 'Exceptional craftsmanship and comfortable fit. Exceeded expectations!';
    return {
      id: row.id,
      name: fullName,
      userName: fullName,
      location: row.is_verified ? 'Verified Buyer' : 'Clothify Member',
      rating: Number(row.rating),
      title: row.title || (Number(row.rating) === 5 ? 'Flawless tailoring & premium fabric' : 'Great quality & fit'),
      comment,
      reviewText: comment,
      itemPurchased: row.product_name || 'Clothify Creation',
      avatar: initials,
      userInitials: initials,
      verified: Boolean(row.is_verified),
      isVerified: Boolean(row.is_verified),
      isFeatured: Boolean(row.is_featured),
      createdAt: row.created_at,
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
  productId?: string | null;
  rating: number;
  reviewText?: string | null;
  title?: string | null;
  feedbackType?: string;
}) => {
  const { userId, rating, reviewText, title } = payload;
  const productId = payload.productId && payload.productId.trim() !== '' ? payload.productId.trim() : null;
  const feedbackType = productId ? (payload.feedbackType || 'product') : 'store';
  const validRating = Math.min(5, Math.max(1, Math.round(Number(rating))));

  let isVerified = false;
  if (productId) {
    const purchaseRes = await pool.query(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = $1 AND oi.product_id = $2
       LIMIT 1`,
      [userId, productId]
    );
    isVerified = purchaseRes.rows.length > 0;
  } else {
    // For general store feedback, check if customer has ever ordered
    const userOrders = await pool.query(
      `SELECT id FROM orders WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    isVerified = userOrders.rows.length > 0;
  }

  const reviewId = crypto.randomUUID();

  let reviewRes;
  if (productId) {
    const insertQuery = `
      INSERT INTO reviews (id, user_id, product_id, rating, title, review_text, feedback_type, is_verified, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (user_id, product_id) WHERE product_id IS NOT NULL
      DO UPDATE SET rating = EXCLUDED.rating,
                    title = EXCLUDED.title,
                    review_text = EXCLUDED.review_text,
                    feedback_type = EXCLUDED.feedback_type,
                    is_verified = EXCLUDED.is_verified,
                    updated_at = NOW()
      RETURNING *
    `;

    reviewRes = await pool.query(insertQuery, [
      reviewId,
      userId,
      productId,
      validRating,
      title?.trim() || null,
      reviewText?.trim() || null,
      feedbackType,
      isVerified,
    ]);

    // Recalculate and update product's average rating and review_count
    await pool.query(
      `UPDATE products
       SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1), 4.8),
           review_count = (SELECT COUNT(*)::int FROM reviews WHERE product_id = $1),
           updated_at = NOW()
       WHERE id = $1`,
      [productId]
    );
  } else {
    // General store feedback
    const insertQuery = `
      INSERT INTO reviews (id, user_id, product_id, rating, title, review_text, feedback_type, is_verified, created_at, updated_at)
      VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    reviewRes = await pool.query(insertQuery, [
      reviewId,
      userId,
      validRating,
      title?.trim() || null,
      reviewText?.trim() || null,
      feedbackType,
      isVerified,
    ]);
  }

  return reviewRes.rows[0];
};

export const getAllReviewsForAdmin = async (filter?: { rating?: number; isFeatured?: boolean; search?: string }) => {
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (filter?.rating) {
    params.push(filter.rating);
    where += ` AND r.rating = $${params.length}`;
  }
  if (filter?.isFeatured !== undefined) {
    params.push(filter.isFeatured);
    where += ` AND r.is_featured = $${params.length}`;
  }
  if (filter?.search) {
    params.push(`%${filter.search.toLowerCase()}%`);
    where += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(r.review_text) LIKE $${params.length} OR LOWER(p.name) LIKE $${params.length})`;
  }

  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.title, r.review_text,
           r.feedback_type, r.is_verified, r.is_featured, r.created_at, r.updated_at,
           u.full_name, u.email,
           p.name AS product_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    LEFT JOIN products p ON p.id = r.product_id
    ${where}
    ORDER BY r.is_featured DESC, r.created_at DESC
  `;
  const res = await pool.query(query, params);
  return res.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.full_name || 'Customer',
    userEmail: row.email,
    productId: row.product_id,
    productName: row.product_name || (row.feedback_type === 'store' ? 'Store & Experience' : 'Clothify Piece'),
    rating: Number(row.rating),
    title: row.title,
    reviewText: row.review_text,
    feedbackType: row.feedback_type || (row.product_id ? 'product' : 'store'),
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const toggleFeaturedReview = async (reviewId: string, isFeatured: boolean) => {
  if (isFeatured) {
    const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM reviews WHERE is_featured = TRUE AND id != $1', [reviewId]);
    const currentCount = countRes.rows[0]?.count || 0;
    if (currentCount >= 3) {
      throw new Error('You can feature up to 3 reviews on the Home Page. Please unfeature an existing one first.');
    }
  }

  const query = `
    UPDATE reviews
    SET is_featured = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const res = await pool.query(query, [isFeatured, reviewId]);
  return res.rows[0] || null;
};

export const deleteReview = async (reviewId: string) => {
  const existing = await pool.query('SELECT product_id FROM reviews WHERE id = $1', [reviewId]);
  const productId = existing.rows[0]?.product_id;

  await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

  if (productId) {
    await pool.query(
      `UPDATE products
       SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1), 4.8),
           review_count = (SELECT COUNT(*)::int FROM reviews WHERE product_id = $1),
           updated_at = NOW()
       WHERE id = $1`,
      [productId]
    );
  }
  return true;
};

export const getUserReviews = async (userId: string): Promise<any[]> => {
  const query = `
    SELECT r.id, r.user_id, r.product_id, r.rating, r.title, r.review_text,
           r.feedback_type, r.is_verified, r.is_featured, r.created_at, r.updated_at,
           p.name AS product_name
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
  const res = await pool.query(query, [userId]);
  return res.rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name || (row.feedback_type === 'store' ? 'General Store Feedback' : 'Clothify Piece'),
    rating: Number(row.rating),
    title: row.title,
    reviewText: row.review_text,
    feedbackType: row.feedback_type || (row.product_id ? 'product' : 'store'),
    isVerified: Boolean(row.is_verified),
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
  }));
};

