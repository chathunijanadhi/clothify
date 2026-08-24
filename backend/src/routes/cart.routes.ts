import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import * as cartController from '../controllers/cart.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
