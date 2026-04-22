import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();

// Public routes (for guest checkout)
router.post('/orders', OrderController.createOrder);

// Protected routes (require authentication)
router.get('/orders/my', authenticate, OrderController.getUserOrders);
router.get('/orders/:orderId', authenticate, OrderController.getOrder);
router.post('/orders/:orderId/payment-intent', authenticate, OrderController.createPaymentIntent);
router.post('/orders/:orderId/confirm-payment', authenticate, OrderController.confirmPayment);
router.post('/orders/:orderId/simulate-payment', authenticate, OrderController.simulatePayment);

// Admin routes
router.get('/admin/orders', authenticate, authorize('ADMIN'), OrderController.getAllOrders);
router.put('/admin/orders/:orderId/status', authenticate, authorize('ADMIN'), OrderController.updateOrderStatus);
router.put('/admin/orders/:orderId/payment-status', authenticate, authorize('ADMIN'), OrderController.updatePaymentStatus);

export { router };