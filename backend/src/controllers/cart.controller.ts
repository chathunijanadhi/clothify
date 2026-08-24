import { Request, Response } from 'express';
import * as cartModel from '../models/cart.model';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await cartModel.getCartByUserId(userId);
    return res.json({ success: true, message: 'Cart retrieved successfully', data: { cart } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to retrieve cart', error: error.message || 'SERVER_ERROR' });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { productId, variantId, quantity } = req.body ?? {};
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ success: false, message: 'Product ID is required', error: 'INVALID_PRODUCT_ID' });
    }

    const resolvedQuantity = Number(quantity ?? 1);
    if (!Number.isFinite(resolvedQuantity) || resolvedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero', error: 'INVALID_QUANTITY' });
    }

    const cart = await cartModel.addItemToCart(userId, productId, resolvedQuantity, variantId ?? null);
    return res.status(201).json({ success: true, message: 'Item added to cart', data: { cart } });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product not found', error: 'PRODUCT_NOT_FOUND' });
    }
    if (error.message === 'VARIANT_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product variant not found', error: 'VARIANT_NOT_FOUND' });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock', error: 'INSUFFICIENT_STOCK' });
    }
    return res.status(500).json({ success: false, message: 'Unable to add item to cart', error: error.message || 'SERVER_ERROR' });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const itemId = String(req.params.itemId ?? '');
    const quantity = Number(req.body?.quantity ?? 0);
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Cart item ID is required', error: 'INVALID_ITEM_ID' });
    }

    const cart = await cartModel.updateCartItem(userId, itemId, quantity);
    return res.json({ success: true, message: 'Cart item updated', data: { cart } });
  } catch (error: any) {
    if (error.message === 'CART_ITEM_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Cart item not found', error: 'CART_ITEM_NOT_FOUND' });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock', error: 'INSUFFICIENT_STOCK' });
    }
    return res.status(500).json({ success: false, message: 'Unable to update cart item', error: error.message || 'SERVER_ERROR' });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const itemId = String(req.params.itemId ?? '');
    if (!itemId) {
      return res.status(400).json({ success: false, message: 'Cart item ID is required', error: 'INVALID_ITEM_ID' });
    }

    const cart = await cartModel.removeCartItem(userId, itemId);
    return res.json({ success: true, message: 'Cart item removed', data: { cart } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to remove cart item', error: error.message || 'SERVER_ERROR' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const cart = await cartModel.clearCart(userId);
    return res.json({ success: true, message: 'Cart cleared successfully', data: { cart } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to clear cart', error: error.message || 'SERVER_ERROR' });
  }
};
