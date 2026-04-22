import express from 'express';
import {
  sendTestEmailHandler,
  getEmailStatusHandler,
  sendWelcomeEmailHandler,
  previewEmailTemplateHandler,
} from '../controllers/emailController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/email/status
 * @desc    Check email service status
 * @access  Public
 */
router.get('/status', getEmailStatusHandler);

/**
 * @route   POST /api/email/test
 * @desc    Send a test email
 * @access  Public (should be protected in production)
 */
router.post('/test', sendTestEmailHandler);

/**
 * @route   POST /api/email/welcome
 * @desc    Send welcome email (for testing)
 * @access  Public (should be protected in production)
 */
router.post('/welcome', sendWelcomeEmailHandler);

/**
 * @route   POST /api/email/preview
 * @desc    Preview email template
 * @access  Public (should be protected in production)
 */
router.post('/preview', previewEmailTemplateHandler);

/**
 * @route   POST /api/email/send
 * @desc    Send custom email (admin only)
 * @access  Private (Admin)
 */
router.post('/send', authenticate, (req, res) => {
  // This would be implemented for admin to send custom emails
  res.status(501).json({
    success: false,
    message: 'Not implemented yet',
  });
});

export { router };