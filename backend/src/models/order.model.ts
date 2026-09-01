import crypto from 'crypto';
import pool from '../config/database';
import { clearCart, getCartByUserId } from './cart.model';

export type OrderPaymentMethod = 'card' | 'bank_transfer';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  variantId?: string | null;
  unitPrice?: number | string | null;
}

export interface CreateOrderPayload {
  paymentMethod?: OrderPaymentMethod | string;
  slipImage?: string | null;
  notes?: string | null;
  items?: OrderItemInput[];
}

export const createOrder = async (userId: string, payload: CreateOrderPayload = {}) => {
  const paymentMethod = (payload.paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'card') as OrderPaymentMethod;

  let inputItems = payload.items && payload.items.length ? payload.items : [];
  if (!inputItems.length) {
    const cart = await getCartByUserId(userId);
    inputItems = cart.items.map((item) => ({
      productId: item.product_id,
      quantity: Number(item.quantity || 0),
      variantId: item.variant_id ?? null,
      unitPrice: Number(item.price_at_time || 0),
    }));
  }

  if (!inputItems.length) {
    throw new Error('EMPTY_CART');
  }

  const normalizedItems: Required<OrderItemInput>[] = [];
  let subtotal = 0;

  for (const item of inputItems) {
    const quantity = Number(item.quantity || 0);
    if (!item.productId || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('INVALID_ORDER_ITEM');
    }

    const productResult = await pool.query(
      'SELECT id, price, final_price, stock_quantity, is_active FROM products WHERE id = $1 LIMIT 1',
      [item.productId]
    );

    const product = productResult.rows[0];
    if (!product) throw new Error('PRODUCT_NOT_FOUND');
    if (!product.is_active) throw new Error('PRODUCT_INACTIVE');

    let availableStock = Number(product.stock_quantity || 0);
    if (item.variantId) {
      const variantResult = await pool.query(
        'SELECT id, stock_quantity, is_active FROM product_variants WHERE id = $1 AND product_id = $2 LIMIT 1',
        [item.variantId, item.productId]
      );
      const variant = variantResult.rows[0];
      if (!variant) throw new Error('VARIANT_NOT_FOUND');
      if (!variant.is_active) throw new Error('VARIANT_INACTIVE');
      availableStock = Number(variant.stock_quantity || 0);
    }

    if (quantity > availableStock) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    const unitPrice = Number(item.unitPrice ?? product.final_price ?? product.price ?? 0);
    subtotal += unitPrice * quantity;
    normalizedItems.push({
      productId: item.productId,
      quantity,
      variantId: item.variantId ?? null,
      unitPrice,
    });
  }

  const shippingFee = subtotal > 0 ? 250 : 0;
  const discountAmount = 0;
  const grandTotal = subtotal + shippingFee - discountAmount;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const orderStatus = paymentMethod === 'card' ? 'confirmed' : 'pending';
    const paymentStatus = paymentMethod === 'card' ? 'paid' : 'pending';

    const orderResult = await client.query(
      `INSERT INTO orders (id, user_id, address_id, order_number, status, total_amount, shipping_fee, discount_amount, grand_total, payment_status, created_at, updated_at)
       VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [orderId, userId, orderNumber, orderStatus, subtotal, shippingFee, discountAmount, grandTotal, paymentStatus]
    );

    for (const item of normalizedItems) {
      const totalPrice = Number(item.unitPrice) * Number(item.quantity);
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [crypto.randomUUID(), orderId, item.productId, item.variantId ?? null, item.quantity, item.unitPrice, totalPrice]
      );
    }

    const paymentId = crypto.randomUUID();
    // If a slip image (data URL) was provided, upload to Cloudinary and store the returned URL instead of the raw data
    let slipImageUrl: string | null = null;
    try {
      if (payload.slipImage && typeof payload.slipImage === 'string' && payload.slipImage.startsWith('data:')) {
        // lazy-require to avoid startup errors when cloudinary not configured
        const cloudinaryService = require('../services/cloudinary.service');
        slipImageUrl = await cloudinaryService.uploadImage(payload.slipImage);
      } else if (payload.slipImage && typeof payload.slipImage === 'string' && payload.slipImage.startsWith('http')) {
        // already a URL
        slipImageUrl = payload.slipImage;
      }
    } catch (err) {
      console.error('Slip upload failed', err);
      // proceed but store original data as fallback
      slipImageUrl = payload.slipImage ?? null;
    }

    const paymentDetails = JSON.stringify({
      method: paymentMethod,
      slipImage: slipImageUrl ?? null,
      notes: payload.notes ?? null,
      createdAt: new Date().toISOString(),
    });

    const paymentResult = await client.query(
      `INSERT INTO payments (id, order_id, user_id, payment_method, transaction_id, amount, status, payment_details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [paymentId, orderId, userId, paymentMethod, paymentMethod === 'card' ? `CARD-${orderNumber}` : null, grandTotal, paymentStatus, paymentDetails]
    );

    await client.query('COMMIT');

    await clearCart(userId);

    return {
      order: orderResult.rows[0],
      payment: paymentResult.rows[0],
      items: normalizedItems,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getOrdersByUser = async (userId: string) => {
  const result = await pool.query(
    `SELECT o.*, p.payment_method, p.status AS payment_row_status, p.payment_details,
            COALESCE((SELECT COUNT(*) FROM order_items WHERE order_id = o.id), 0)::int AS item_count,
            COALESCE((
              SELECT json_agg(json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', pr.name,
                'product_image', (SELECT image_url FROM product_images pi WHERE pi.product_id = pr.id ORDER BY is_primary DESC, created_at ASC LIMIT 1),
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price,
                'size', pv.size,
                'color', pv.color,
                'user_rating', rev.rating,
                'user_review', rev.review_text
              ))
              FROM order_items oi
              LEFT JOIN products pr ON pr.id = oi.product_id
              LEFT JOIN product_variants pv ON pv.id = oi.variant_id
              LEFT JOIN reviews rev ON rev.product_id = oi.product_id AND rev.user_id = o.user_id
              WHERE oi.order_id = o.id
            ), '[]'::json) AS items
     FROM orders o
     LEFT JOIN payments p ON p.order_id = o.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    ...row,
    payment_details: row.payment_details ? (() => {
      try {
        return JSON.parse(row.payment_details);
      } catch {
        return row.payment_details;
      }
    })() : null,
  }));
};

export const getOrderByUserAndId = async (userId: string, orderId: string) => {
  const result = await pool.query(
    `SELECT o.*, p.payment_method, p.status AS payment_row_status, p.payment_details
     FROM orders o
     LEFT JOIN payments p ON p.order_id = o.id
     WHERE o.user_id = $1 AND o.id = $2
     LIMIT 1`,
    [userId, orderId]
  );

  return result.rows[0] ?? null;
};

export const updateOrderPaymentStatus = async (orderId: string, adminUserId: string, status: 'paid' | 'rejected', note?: string) => {
  const normalizedStatus = status === 'paid' ? 'paid' : 'rejected';
  const paymentState = normalizedStatus === 'paid' ? 'paid' : 'failed';
  const orderState = normalizedStatus === 'paid' ? 'confirmed' : 'cancelled';

  const validTransitions: Record<string, string[]> = {
    pending: ['paid', 'rejected'],
    confirmed: ['paid'],
    cancelled: ['paid'],
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentOrder = await client.query(
      'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
      [orderId]
    );

    if (!currentOrder.rows[0]) {
      await client.query('ROLLBACK');
      return { order: null, payment: null };
    }

    const currentStatus = String(currentOrder.rows[0].status ?? 'pending');
    const allowedNextStatuses = validTransitions[currentStatus] ?? [];
    if (allowedNextStatuses.length && !allowedNextStatuses.includes(normalizedStatus === 'paid' ? 'paid' : 'rejected')) {
      await client.query('ROLLBACK');
      throw new Error('INVALID_ORDER_STATUS_TRANSITION');
    }

    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE order_id = $1 LIMIT 1',
      [orderId]
    );

    const existingPayment = paymentResult.rows[0];
    const existingDetails = (() => {
      try {
        return existingPayment?.payment_details ? JSON.parse(existingPayment.payment_details) : {};
      } catch {
        return {};
      }
    })();

    const details = {
      ...existingDetails,
      reviewedBy: adminUserId,
      reviewedAt: new Date().toISOString(),
      adminDecision: normalizedStatus,
      reviewNote: note ?? existingDetails.reviewNote ?? '',
    };

    if (normalizedStatus === 'paid' && currentOrder.rows[0].payment_status !== 'paid') {
      const orderItems = await client.query(
        'SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      for (const item of orderItems.rows) {
        const quantity = Number(item.quantity || 0);
        if (quantity <= 0) continue;

        if (item.variant_id) {
          await client.query(
            'UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = NOW() WHERE id = $2',
            [quantity, item.variant_id]
          );

          const totals = await client.query(
            'SELECT COALESCE(SUM(stock_quantity), 0)::int AS total FROM product_variants WHERE product_id = $1',
            [item.product_id]
          );

          await client.query(
            'UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2',
            [Number(totals.rows[0]?.total ?? 0), item.product_id]
          );
        } else {
          await client.query(
            'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = NOW() WHERE id = $2',
            [quantity, item.product_id]
          );
        }
      }
    }

    const paymentUpdate = await client.query(
      'UPDATE payments SET status = $1, payment_details = $2 WHERE order_id = $3 RETURNING *',
      [paymentState, JSON.stringify(details), orderId]
    );

    const orderResult = await client.query(
      'UPDATE orders SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [orderState, paymentState === 'paid' ? 'paid' : 'failed', orderId]
    );

    await client.query('COMMIT');
    return {
      order: orderResult.rows[0],
      payment: paymentUpdate.rows[0] ?? null,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
