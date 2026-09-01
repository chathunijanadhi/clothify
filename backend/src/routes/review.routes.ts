import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/my-review', authMiddleware, reviewController.getMyReview);
router.post('/product/:productId', authMiddleware, reviewController.createReview);

export default router;
