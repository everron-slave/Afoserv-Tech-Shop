import { Router } from 'express';
import { MockAuthController } from '../controllers/mockAuthController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter';
import { validators } from '../utils/validators';
import cookieParser from 'cookie-parser';

const router = Router();

// Parse cookies for refresh token
router.use(cookieParser());

// Apply stricter rate limiting to auth endpoints
router.use(authLimiter);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  validate(validators.registerSchema),
  MockAuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(validators.loginSchema),
  MockAuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', MockAuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', MockAuthController.refresh);

// Protected routes - require authentication
router.use(authenticate);
router.use(apiLimiter); // Regular rate limiting for authenticated routes

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', MockAuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  validate(validators.updateProfileSchema),
  MockAuthController.getProfile // Placeholder - would need implementation
);

export { router };