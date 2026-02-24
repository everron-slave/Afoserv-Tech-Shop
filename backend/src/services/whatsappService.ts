import { whatsappApi, messageTemplates, validateWhatsAppConfig } from '../config/whatsapp';
import prisma from '../config/database';

export class WhatsAppService {
  private static isConfigured = false;

  /**
   * Initialize WhatsApp service
   */
  static initialize() {
    this.isConfigured = validateWhatsAppConfig();
    if (this.isConfigured) {
      console.log('✅ WhatsApp service initialized');
    } else {
      console.log('⚠️ WhatsApp service disabled - missing configuration');
    }
  }

  /**
   * Check if WhatsApp is configured
   */
  static isReady() {
    return this.isConfigured;
  }

  /**
   * Verify webhook from WhatsApp
   */
  static verifyWebhook(mode: string, token: string, challenge: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token === verifyToken) {
      return challenge;
    }

    throw new Error('Invalid verification token');
  }

  /**
   * Process incoming WhatsApp message
   */
  static async processMessage(message: any) {
    if (!this.isConfigured) {
      console.warn('WhatsApp service not configured, ignoring message');
      return;
    }

    try {
      const messageType = this.getMessageType(message);

      switch (messageType) {
        case 'text':
          await this.handleTextMessage(message);
          break;
        case 'interactive':
          await this.handleInteractiveMessage(message);
          break;
        case 'image':
        case 'video':
        case 'document':
          await this.handleMediaMessage(message);
          break;
        default:
          console.log(`Unhandled message type: ${messageType}`);
      }
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }

  /**
   * Send WhatsApp message
   */
  static async sendMessage(to: string, message: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const response = await whatsappApi.post('/messages', {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          body: message,
        },
      });

      console.log('WhatsApp message sent:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Send cart sharing message
   */
  static async sendCartShare(cartId: string, phoneNumber: string, customMessage?: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      // Get cart with items
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart not found or empty');
      }

      // Format cart items
      const cartItems = cart.items.map((item: any) => ({
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
      }));

      const total = cartItems.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity),
        0
      );

      // Generate message
      const message = customMessage || messageTemplates.cartShare(cartItems, total);

      // Send message
      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending cart share:', error);
      throw error;
    }
  }

  /**
   * Send product inquiry message
   */
  static async sendProductInquiry(productId: string, phoneNumber: string, customMessage?: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          name: true,
          price: true,
          description: true,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Generate message
      const message = customMessage || messageTemplates.productInquiry({
        name: product.name,
        price: Number(product.price),
        description: product.description || undefined,
      });

      // Send message
      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending product inquiry:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation message
   */
  static async sendOrderConfirmation(orderId: string, phoneNumber: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      // Get order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Generate message
      const message = messageTemplates.orderConfirmation(
        orderId,
        Number(order.totalAmount),
        order.status
      );

      // Send message
      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  /**
   * Send welcome message to new user
   */
  static async sendWelcomeMessage(userId: string, phoneNumber: string) {
    if (!this.isConfigured) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate message
      const message = messageTemplates.welcomeMessage(user.name || 'there');

      // Send message
      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending welcome message:', error);
      throw error;
    }
  }

  /**
   * Private helper: Determine message type
   */
  private static getMessageType(message: any): string {
    if (message.text) return 'text';
    if (message.interactive) return 'interactive';
    if (message.image) return 'image';
    if (message.video) return 'video';
    if (message.document) return 'document';
    if (message.audio) return 'audio';
    if (message.sticker) return 'sticker';
    if (message.location) return 'location';
    if (message.contacts) return 'contacts';
    return 'unknown';
  }

  /**
   * Private helper: Handle text message
   */
  private static async handleTextMessage(message: any) {
    const from = message.from;
    const text = message.text.body;

    console.log(`Received text message from ${from}: ${text}`);

    // Check if this is a reply to a cart/product inquiry
    const isReply = message.context?.id;

    // For now, send a generic response
    const response = `Thank you for your message! We'll get back to you shortly.

You can also:
• Type "cart" to share your cart
• Type "products" to browse our catalog
• Type "help" for assistance`;

    await this.sendMessage(from, response);
  }

  /**
   * Private helper: Handle interactive message (buttons, lists)
   */
  private static async handleInteractiveMessage(message: any) {
    const from = message.from;
    const interactive = message.interactive;

    console.log(`Received interactive message from ${from}:`, interactive);

    // Handle button replies
    if (interactive.type === 'button_reply') {
      const buttonId = interactive.button_reply.id;
      const buttonText = interactive.button_reply.title;

      // Handle different button actions
      switch (buttonId) {
        case 'browse_products':
          await this.sendMessage(from, 'Great! You can browse our products at https://aforsev.com/products');
          break;
        case 'contact_support':
          await this.sendMessage(from, 'Our support team will contact you shortly. For urgent matters, call +1234567890');
          break;
        case 'order_status':
          await this.sendMessage(from, 'Please share your order number or email to check your order status.');
          break;
        default:
          await this.sendMessage(from, `You selected: ${buttonText}. How can I help you with this?`);
      }
    }
  }

  /**
   * Private helper: Handle media message
   */
  private static async handleMediaMessage(message: any) {
    const from = message.from;
    const mediaType = this.getMessageType(message);

    console.log(`Received ${mediaType} message from ${from}`);

    // Acknowledge media messages
    await this.sendMessage(
      from,
      `Thanks for sharing the ${mediaType}! Our team will review it and get back to you if needed.`
    );
  }
}

// Initialize service on import
WhatsAppService.initialize();