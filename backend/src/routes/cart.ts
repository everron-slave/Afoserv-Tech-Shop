import { Router } from 'express';
import { CartController } from '../controllers/cartController';
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
router.get('/', CartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private (or guest with session)
 */
router.post(
  '/',
  validate(validators.addToCartSchema),
  CartController.addToCart
);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private (or guest with session)
 */
router.put(
  '/items/:itemId',
  validate(validators.updateCartItemSchema),
  CartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (or guest with session)
 */
router.delete('/items/:itemId', CartController.removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private (or guest with session)
 */
router.delete('/', CartController.clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart with user cart (on login)
 * @access  Private
 */
router.post('/merge', authenticate, CartController.mergeCarts);

export { router };