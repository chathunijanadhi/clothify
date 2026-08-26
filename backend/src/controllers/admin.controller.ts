import type { Request, Response } from 'express';
import pool from '../config/database';
import * as orderModel from '../models/order.model';
import * as productService from '../services/product.service';

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const [userCount, customerCount, productCount, orderCount, recentCustomers] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM users'),
      pool.query('SELECT COUNT(*)::int AS total FROM users WHERE role = $1', ['customer']),
      pool.query('SELECT COUNT(*)::int AS total FROM products WHERE is_active = true'),
      pool.query('SELECT COUNT(*)::int AS total FROM orders'),
      pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT 5', ['customer'])
    ]);

    return res.json({
      success: true,
      message: 'Admin summary retrieved successfully',
      data: {
        summary: {
          totalUsers: Number(userCount.rows[0]?.total ?? 0),
          totalCustomers: Number(customerCount.rows[0]?.total ?? 0),
          totalProducts: Number(productCount.rows[0]?.total ?? 0),
          totalOrders: Number(orderCount.rows[0]?.total ?? 0),
          recentCustomers: recentCustomers.rows,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load admin summary', error: error.message || 'SERVER_ERROR' });
  }
};

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    return res.json({ success: true, message: 'Customers retrieved successfully', data: { customers: result.rows } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load customers', error: error.message || 'SERVER_ERROR' });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.order_number, o.status, o.grand_total, o.payment_status, o.created_at,
             o.total_amount, o.shipping_fee, p.payment_method, p.status AS payment_row_status, p.payment_details,
             u.full_name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN payments p ON p.order_id = o.id
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);

    const orders = result.rows.map((row) => {
      let slipImage: string | null = null;
      try {
        const details = row.payment_details ? JSON.parse(row.payment_details) : {};
        slipImage = details.slipImage || null;
      } catch {
        slipImage = null;
      }

      return {
        ...row,
        slipImage,
      };
    });

    return res.json({ success: true, message: 'Orders retrieved successfully', data: { orders } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load orders', error: error.message || 'SERVER_ERROR' });
  }
};

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.order_id, p.user_id, p.payment_method, p.amount, p.status, p.payment_details, p.created_at,
             o.order_number, o.grand_total, o.status AS order_status, o.payment_status,
             u.full_name AS customer_name, u.email AS customer_email
      FROM payments p
      LEFT JOIN orders o ON o.id = p.order_id
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    const payments = result.rows.map((row) => {
      let slipImage: string | null = null;
      let notes: string | null = null;
      let reviewNote: string | null = null;
      let adminDecision: string | null = null;
      try {
        const details = row.payment_details ? JSON.parse(row.payment_details) : {};
        slipImage = details.slipImage || null;
        notes = details.notes || null;
        reviewNote = details.reviewNote || null;
        adminDecision = details.adminDecision || null;
      } catch {
        slipImage = null;
        notes = null;
        reviewNote = null;
        adminDecision = null;
      }

      return {
        ...row,
        slipImage,
        notes,
        reviewNote,
        adminDecision,
      };
    });

    return res.json({ success: true, message: 'Payments retrieved successfully', data: { payments } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load payments', error: error.message || 'SERVER_ERROR' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId ?? '');
    const status = String(req.body?.status ?? '').toLowerCase();
    const note = typeof req.body?.note === 'string' ? req.body.note : undefined;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required', error: 'INVALID_ORDER_ID' });
    }
    if (!['paid', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either paid or rejected', error: 'INVALID_PAYMENT_STATUS' });
    }

    const updated = await orderModel.updateOrderPaymentStatus(orderId, (req as any).auth?.userId ?? '', status as 'paid' | 'rejected', note);

    if (!updated.order) {
      return res.status(404).json({ success: false, message: 'Order not found', error: 'ORDER_NOT_FOUND' });
    }

    return res.json({
      success: true,
      message: status === 'paid' ? 'Payment confirmed successfully' : 'Payment rejected successfully',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to update payment status', error: error.message || 'SERVER_ERROR' });
  }
};

export const getCatalog = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getProducts({}, 1, 200);
    const productIds = products.map((product) => product.id);
    const [images, variants] = await Promise.all([
      productService.getProductImages(productIds),
      productService.getProductVariants(productIds),
    ]);

    const imageMap = new Map<string, any[]>();
    const variantMap = new Map<string, any[]>();

    images.forEach((image) => {
      const current = imageMap.get(image.product_id) ?? [];
      current.push(image);
      imageMap.set(image.product_id, current);
    });

    variants.forEach((variant) => {
      const current = variantMap.get(variant.product_id) ?? [];
      current.push(variant);
      variantMap.set(variant.product_id, current);
    });

    return res.json({
      success: true,
      message: 'Catalog retrieved successfully',
      data: {
        products: products.map((product) => ({
          ...product,
          images: imageMap.get(product.id) ?? [],
          variants: variantMap.get(product.id) ?? [],
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load catalog', error: error.message || 'SERVER_ERROR' });
  }
};
