import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsappController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { webhookLimiter, apiLimiter } from '../middleware/rateLimiter';
import { validators } from '../utils/validators';
import cookieParser from 'cookie-parser';

const router = Router();

// Parse cookies for session ID
router.use(cookieParser());

/**
 * @route   GET /webhook
 * @desc    WhatsApp webhook verification
 * @access  Public (called by WhatsApp)
 */
router.get('/', webhookLimiter, WhatsAppController.verifyWebhook);

/**
 * @route   POST /webhook
 * @desc    Handle incoming WhatsApp messages
 * @access  Public (called by WhatsApp)
 */
router.post('/', webhookLimiter, WhatsAppController.handleWebhook);

// API routes - require authentication and regular rate limiting
router.use(apiLimiter);

/**
 * @route   GET /api/whatsapp/status
 * @desc    Get WhatsApp service status
 * @access  Private
 */
router.get('/status', authenticate, WhatsAppController.getStatus);

/**
 * @route   POST /api/whatsapp/share-cart
 * @desc    Share cart via WhatsApp
 * @access  Private (or guest with session)
 */
router.post(
  '/share-cart',
  validate(validators.shareCartSchema),
  WhatsAppController.shareCart
);

/**
 * @route   POST /api/whatsapp/share-product
 * @desc    Share product via WhatsApp
 * @access  Public
 */
router.post(
  '/share-product',
  validate(validators.shareProductSchema),
  WhatsAppController.shareProduct
);

/**
 * @route   POST /api/whatsapp/test
 * @desc    Send test WhatsApp message
 * @access  Private/Admin
 */
router.post(
  '/test',
  authenticate,
  WhatsAppController.sendTestMessage
);

export { router };