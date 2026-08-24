import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import * as wishlistController from '../controllers/wishlist.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', wishlistController.getWishlist);
router.post('/items', wishlistController.addItem);
router.delete('/items/:productId', wishlistController.removeItem);

export default router;
