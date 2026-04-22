import { Router } from 'express';
import { AuthController } from '../controllers/authController';
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
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(validators.loginSchema),
  AuthController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', AuthController.refreshToken);

// Protected routes - require authentication
router.use(authenticate);
router.use(apiLimiter); // Regular rate limiting for authenticated routes

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  validate(validators.updateProfileSchema),
  AuthController.updateProfile
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  AuthController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  AuthController.resetPassword
);

export { router };