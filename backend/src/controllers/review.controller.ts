import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const reviews = await reviewService.getReviewsByProduct(productId);
    return res.json({ success: true, data: { reviews } });
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({ success: false, message: 'Unable to load reviews', error: error.message });
  }
};

export const getMyReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const productId = String(req.params.productId);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await reviewService.getUserReview(userId, productId);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user review:', error);
    return res.status(500).json({ success: false, message: 'Unable to load user review', error: error.message });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const productId = String(req.params.productId);
    const { rating, reviewText } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to submit a review.' });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Please select a valid rating between 1 and 5 stars.' });
    }

    const review = await reviewService.createOrUpdateReview({
      userId,
      productId,
      rating: Number(rating),
      reviewText,
    });

    return res.json({
      success: true,
      message: 'Thank you! Your review and rating have been recorded.',
      data: { review },
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return res.status(500).json({ success: false, message: 'Unable to submit review', error: error.message });
  }
};
