import { Request, Response } from 'express';
import * as wishlistModel from '../models/wishlist.model';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const wishlist = await wishlistModel.getWishlistByUserId(userId);
    return res.json({ success: true, message: 'Wishlist retrieved successfully', data: { wishlist } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to retrieve wishlist', error: error.message || 'SERVER_ERROR' });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const productId = String(req.body?.productId ?? '');
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required', error: 'INVALID_PRODUCT_ID' });
    }

    const wishlist = await wishlistModel.addItemToWishlist(userId, productId);
    return res.status(201).json({ success: true, message: 'Item added to wishlist', data: { wishlist } });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Product not found', error: 'PRODUCT_NOT_FOUND' });
    }
    return res.status(500).json({ success: false, message: 'Unable to add item to wishlist', error: error.message || 'SERVER_ERROR' });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const productId = String(req.params.productId ?? '');
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required', error: 'INVALID_PRODUCT_ID' });
    }

    const wishlist = await wishlistModel.removeItemFromWishlist(userId, productId);
    return res.json({ success: true, message: 'Item removed from wishlist', data: { wishlist } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Unable to remove wishlist item', error: error.message || 'SERVER_ERROR' });
  }
};
