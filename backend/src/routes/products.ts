import { Router } from 'express';
import { ProductController } from '../controllers/productController';
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
  ProductController.getProducts
);

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories', ProductController.getCategories);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', ProductController.getFeaturedProducts);

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
  ProductController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put(
  '/:id',
  validate(validators.updateProductSchema),
  ProductController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', ProductController.deleteProduct);

export { router };