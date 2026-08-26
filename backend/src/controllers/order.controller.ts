import type { Request, Response } from 'express';
import * as orderModel from '../models/order.model';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const payload = req.body ?? {};
    const order = await orderModel.createOrder(userId, {
      paymentMethod: payload.paymentMethod,
      slipImage: payload.slipImage ?? null,
      notes: payload.notes ?? null,
      items: Array.isArray(payload.items) ? payload.items : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error: any) {
    if (error.message === 'EMPTY_CART') {
      return res.status(400).json({ success: false, message: 'Your cart is empty', error: 'EMPTY_CART' });
    }
    if (error.message === 'INVALID_ORDER_ITEM') {
      return res.status(400).json({ success: false, message: 'Invalid order item', error: 'INVALID_ORDER_ITEM' });
    }
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'A product in your cart was not found', error: 'PRODUCT_NOT_FOUND' });
    }
    if (error.message === 'PRODUCT_INACTIVE') {
      return res.status(400).json({ success: false, message: 'One or more products are unavailable', error: 'PRODUCT_INACTIVE' });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ success: false, message: 'One or more items exceed the available stock', error: 'INSUFFICIENT_STOCK' });
    }

    return res.status(500).json({ success: false, message: 'Unable to place order', error: error.message || 'SERVER_ERROR' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await orderModel.getOrdersByUser(userId);
    return res.json({ success: true, message: 'Orders retrieved successfully', data: { orders } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load orders', error: error.message || 'SERVER_ERROR' });
  }
};

export const getMyOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orderId = String(req.params.id ?? '');
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required', error: 'INVALID_ORDER_ID' });
    }

    const order = await orderModel.getOrderByUserAndId(userId, orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', error: 'ORDER_NOT_FOUND' });
    }

    return res.json({ success: true, message: 'Order retrieved successfully', data: { order } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to load order', error: error.message || 'SERVER_ERROR' });
  }
};
