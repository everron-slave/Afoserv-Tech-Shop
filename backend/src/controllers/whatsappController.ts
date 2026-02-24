import { Request, Response, NextFunction } from 'express';
import { WhatsAppService } from '../services/whatsappService';
import prisma from '../config/database';

export class WhatsAppController {
  /**
   * Webhook verification (GET)
   */
  static async verifyWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      const result = WhatsAppService.verifyWebhook(mode, token, challenge);

      res.status(200).send(result);
    } catch (error: any) {
      console.error('Webhook verification failed:', error.message);
      res.status(403).json({
        success: false,
        error: {
          code: 'WEBHOOK_VERIFICATION_FAILED',
          message: error.message,
        },
      });
    }
  }

  /**
   * Webhook message processing (POST)
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;

      // Check if this is a webhook verification challenge
      if (body.object) {
        if (body.object === 'whatsapp_business_account') {
          res.status(200).json({
            success: true,
            message: 'Webhook received',
          });

          // Process entry
          if (body.entry && body.entry.length > 0) {
            const entry = body.entry[0];
            const changes = entry.changes;

            if (changes && changes.length > 0) {
              const change = changes[0];
              const value = change.value;

              // Process messages
              if (value.messages && value.messages.length > 0) {
                for (const message of value.messages) {
                  await WhatsAppService.processMessage(message);
                }
              }

              // Process status updates
              if (value.statuses && value.statuses.length > 0) {
                for (const status of value.statuses) {
                  console.log('Message status update:', status);
                }
              }
            }
          }
        } else {
          res.status(404).json({
            success: false,
            error: {
              code: 'INVALID_WEBHOOK_OBJECT',
              message: 'Invalid webhook object type',
            },
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_WEBHOOK_PAYLOAD',
            message: 'Invalid webhook payload',
          },
        });
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      // Still return 200 to prevent WhatsApp from retrying
      res.status(200).json({
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: 'Error processing webhook',
        },
      });
    }
  }

  /**
   * Share cart via WhatsApp
   */
  static async shareCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
      const { phoneNumber, message: customMessage } = req.body;

      // Get user's cart
      let cart;
      if (userId) {
        cart = await prisma.cart.findUnique({
          where: { userId },
        });
      } else if (sessionId) {
        cart = await prisma.cart.findUnique({
          where: { sessionId },
        });
      }

      if (!cart) {
        const error = new Error('Cart not found');
        (error as any).statusCode = 404;
        (error as any).code = 'CART_NOT_FOUND';
        throw error;
      }

      // Send cart share via WhatsApp
      const result = await WhatsAppService.sendCartShare(cart.id, phoneNumber, customMessage);

      res.json({
        success: true,
        message: 'Cart shared via WhatsApp',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'WhatsApp service not configured') {
        const err = new Error('WhatsApp integration not configured');
        (err as any).statusCode = 503;
        (err as any).code = 'WHATSAPP_NOT_CONFIGURED';
        return next(err);
      }
      next(error);
    }
  }

  /**
   * Share product via WhatsApp
   */
  static async shareProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, phoneNumber, message: customMessage } = req.body;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!product) {
        const error = new Error('Product not found');
        (error as any).statusCode = 404;
        (error as any).code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      // Send product inquiry via WhatsApp
      const result = await WhatsAppService.sendProductInquiry(
        productId,
        phoneNumber,
        customMessage
      );

      res.json({
        success: true,
        message: 'Product shared via WhatsApp',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'WhatsApp service not configured') {
        const err = new Error('WhatsApp integration not configured');
        (err as any).statusCode = 503;
        (err as any).code = 'WHATSAPP_NOT_CONFIGURED';
        return next(err);
      }
      next(error);
    }
  }

  /**
   * Get WhatsApp service status
   */
  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const isConfigured = WhatsAppService.isReady();

      res.json({
        success: true,
        data: {
          configured: isConfigured,
          features: {
            cartSharing: isConfigured,
            productInquiry: isConfigured,
            orderNotifications: isConfigured,
            customerSupport: isConfigured,
          },
          requirements: {
            accessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
            phoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
            verifyToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
            businessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send test WhatsApp message
   */
  static async sendTestMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, message } = req.body;

      if (!phoneNumber) {
        const error = new Error('Phone number is required');
        (error as any).statusCode = 400;
        (error as any).code = 'PHONE_NUMBER_REQUIRED';
        throw error;
      }

      const result = await WhatsAppService.sendMessage(
        phoneNumber,
        message || 'Test message from AFORSEV E-commerce API'
      );

      res.json({
        success: true,
        message: 'Test message sent',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'WhatsApp service not configured') {
        const err = new Error('WhatsApp integration not configured');
        (err as any).statusCode = 503;
        (err as any).code = 'WHATSAPP_NOT_CONFIGURED';
        return next(err);
      }
      next(error);
    }
  }
}