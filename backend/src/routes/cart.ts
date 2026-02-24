import { Router } from 'express';
import { MockCartController } from '../controllers/mockCartController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { validators } from '../utils/validators';
import cookieParser from 'cookie-parser';

const router = Router();

// Parse cookies for session ID
router.use(cookieParser());

// Apply rate limiting to all cart routes
router.use(apiLimiter);

/**
 * @route   GET /api/cart
 * @desc    Get cart contents
 * @access  Private (or guest with session)
 */
router.get('/', MockCartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private (or guest with session)
 */
router.post(
  '/',
  validate(validators.addToCartSchema),
  MockCartController.addToCart
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private (or guest with session)
 */
router.put(
  '/items/:itemId',
  validate(validators.updateCartItemSchema),
  MockCartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (or guest with session)
 */
router.delete('/items/:itemId', MockCartController.removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private (or guest with session)
 */
router.delete('/', MockCartController.clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart with user cart (on login)
 * @access  Private
 */
router.post('/merge', authenticate, MockCartController.getCart); // Placeholder - would need implementation

export { router };