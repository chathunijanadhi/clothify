import { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export const getFeaturedReviews = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(3, Math.max(1, Number(req.query.limit || 3)));
    const reviews = await reviewService.getFeaturedReviews(limit);
    return res.json({ success: true, data: { reviews } });
  } catch (error: any) {
    console.error('Error fetching featured reviews:', error);
    return res.status(500).json({ success: false, message: 'Unable to load featured reviews', error: error.message });
  }
};

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
    const { rating, reviewText, title, feedbackType } = req.body;

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
      title,
      feedbackType,
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

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    const { rating, reviewText, title, productId, feedbackType } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please log in to submit your feedback.' });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a star rating between 1 and 5.' });
    }

    if (!reviewText || reviewText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a short description or comment for your feedback.' });
    }

    const review = await reviewService.createOrUpdateReview({
      userId,
      productId: productId || null,
      rating: Number(rating),
      reviewText,
      title,
      feedbackType: feedbackType || (productId ? 'product' : 'store'),
    });

    return res.json({
      success: true,
      message: 'Thank you for your valuable feedback! It helps us craft an exceptional experience.',
      data: { review },
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ success: false, message: 'Unable to record feedback', error: error.message });
  }
};

export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const reviews = await reviewService.getUserReviews(userId);
    return res.json({ success: true, data: { reviews } });
  } catch (error: any) {
    console.error('Error fetching user feedback history:', error);
    return res.status(500).json({ success: false, message: 'Unable to load your feedback history', error: error.message });
  }
};

export const getAllReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const rating = req.query.rating ? Number(req.query.rating) : undefined;
    const isFeatured = req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const reviews = await reviewService.getAllReviewsForAdmin({ rating, isFeatured, search });
    return res.json({ success: true, data: { reviews } });
  } catch (error: any) {
    console.error('Error in getAllReviewsAdmin:', error);
    return res.status(500).json({ success: false, message: 'Unable to load reviews for admin', error: error.message });
  }
};

export const toggleFeaturedAdmin = async (req: Request, res: Response) => {
  try {
    const reviewId = String(req.params.id);
    const { isFeatured } = req.body;

    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid isFeatured boolean parameter' });
    }

    const review = await reviewService.toggleFeaturedReview(reviewId, isFeatured);
    return res.json({
      success: true,
      message: isFeatured ? 'Review featured on Home page!' : 'Review removed from Home page.',
      data: { review },
    });
  } catch (error: any) {
    console.error('Error toggling featured review:', error);
    return res.status(500).json({ success: false, message: 'Unable to update review feature status', error: error.message });
  }
};

export const deleteReviewAdmin = async (req: Request, res: Response) => {
  try {
    const reviewId = String(req.params.id);
    await reviewService.deleteReview(reviewId);
    return res.json({ success: true, message: 'Review successfully removed.' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete review', error: error.message });
  }
};

