import { Router } from 'express';
import { MockProductController } from '../controllers/mockProductController';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { validators } from '../utils/validators';

const router = Router();

// Apply rate limiting to all product routes
router.use(apiLimiter);

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering
 * @access  Public
 */
router.get(
  '/',
  validate(validators.productFilterSchema),
  MockProductController.getProducts
);

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories', MockProductController.getCategories);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', MockProductController.getProductById);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', MockProductController.getFeaturedProducts);

// Admin routes - require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post(
  '/',
  validate(validators.createProductSchema),
  MockProductController.getProducts // Placeholder - would need implementation
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put(
  '/:id',
  validate(validators.updateProductSchema),
  MockProductController.getProducts // Placeholder - would need implementation
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', MockProductController.getProducts); // Placeholder - would need implementation

export { router };