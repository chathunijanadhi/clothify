import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authMiddleware);
router.use((req, res, next) => {
  const role = (req as any).auth?.role;
  if (role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
});

router.get('/summary', adminController.getSummary);
router.get('/customers', adminController.getCustomers);
router.get('/orders', adminController.getOrders);
router.get('/payments', adminController.getPayments);
router.patch('/orders/:orderId/payment', adminController.updatePaymentStatus);
router.patch('/payments/:orderId', adminController.updatePaymentStatus);
router.get('/catalog', adminController.getCatalog);

export default router;
