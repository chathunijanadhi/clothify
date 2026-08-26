import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getMyOrder);
router.post('/', orderController.createOrder);

export default router;
