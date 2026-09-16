import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

// Public review queries
router.get('/featured', reviewController.getFeaturedReviews);
router.get('/product/:productId', reviewController.getProductReviews);

// Customer feedback & reviews
router.get('/product/:productId/my-review', authMiddleware, reviewController.getMyReview);
router.get('/my', authMiddleware, reviewController.getMyReviews);
router.post('/product/:productId', authMiddleware, reviewController.createReview);
router.post('/', authMiddleware, reviewController.createFeedback);

// Admin review & feedback moderation
const requireAdmin = (req: any, res: any, next: any) => {
  const role = req.auth?.role;
  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.get('/admin/all', authMiddleware, requireAdmin, reviewController.getAllReviewsAdmin);
router.patch('/admin/:id/featured', authMiddleware, requireAdmin, reviewController.toggleFeaturedAdmin);
router.delete('/admin/:id', authMiddleware, requireAdmin, reviewController.deleteReviewAdmin);

export default router;
