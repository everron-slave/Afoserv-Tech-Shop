import nodemailer from 'nodemailer';
import { emailConfig, isEmailConfigured } from '../config/email';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface CartItemInfo {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
  imageUrl?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!isEmailConfigured()) {
      console.warn('Email service is not configured. Skipping email send.');
      return false;
    }

    try {
      const from = `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`;
      
      if (!this.transporter) {
        throw new Error('No email transport configured');
      }

      const mailOptions = {
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
      };
      
      await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to AFORSEV E-commerce!';
    const html = this.generateWelcomeEmail(name, to);
    return this.sendEmail({ to, subject, html });
  }

  async sendOrderConfirmationEmail(to: string, name: string, orderId: string, orderTotal: number, items: Array<{ name: string; quantity: number; price: number }>): Promise<boolean> {
    const subject = `Order Confirmation - #${orderId}`;
    const html = this.generateOrderConfirmationEmail(name, orderId, orderTotal, items);
    return this.sendEmail({ to, subject, html });
  }

  async sendShippingNotificationEmail(to: string, name: string, orderId: string, trackingNumber?: string, carrier?: string): Promise<boolean> {
    const subject = `Your Order #${orderId} Has Shipped!`;
    const html = this.generateShippingNotificationEmail(name, orderId, trackingNumber, carrier);
    return this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<boolean> {
    const subject = 'Reset Your AFORSEV Password';
    const html = this.generatePasswordResetEmail(name, resetToken);
    return this.sendEmail({ to, subject, html });
  }

  async sendAbandonedCartEmail(to: string, name: string, cartItems: Array<{ name: string; price: number }>): Promise<boolean> {
    const subject = 'Complete Your Purchase at AFORSEV';
    const html = this.generateAbandonedCartEmail(name, cartItems);
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send notification to admin when a user adds an item to cart
   */
  async sendCartNotificationToAdmin(
    adminEmail: string,
    customerInfo: CustomerInfo,
    product: { name: string; price: number; quantity: number; imageUrl?: string }
  ): Promise<boolean> {
    const subject = `🛒 ${customerInfo.name} added "${product.name}" to cart`;
    const html = this.generateCartNotificationAdminEmail(customerInfo, product);
    return this.sendEmail({ to: adminEmail, subject, html });
  }

  /**
   * Send notification to admin when a new order is placed
   */
  async sendNewOrderNotificationToAdmin(
    adminEmail: string,
    customerInfo: CustomerInfo,
    orderId: string,
    orderTotal: number,
    items: CartItemInfo[]
  ): Promise<boolean> {
    const subject = `🛍️ New Order #${orderId} from ${customerInfo.name} - $${orderTotal.toFixed(2)}`;
    const html = this.generateNewOrderAdminEmail(customerInfo, orderId, orderTotal, items);
    return this.sendEmail({ to: adminEmail, subject, html });
  }

  /**
   * Enhanced order confirmation to customer with full details
   */
  async sendEnhancedOrderConfirmationEmail(
    to: string,
    customerInfo: CustomerInfo,
    orderId: string,
    orderTotal: number,
    items: CartItemInfo[]
  ): Promise<boolean> {
    const subject = `Order Confirmed - #${orderId}`;
    const html = this.generateEnhancedOrderConfirmationEmail(customerInfo, orderId, orderTotal, items);
    return this.sendEmail({ to, subject, html });
  }

  // Template generation methods
  private generateWelcomeEmail(name: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AFORSEV!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for creating an account with AFORSEV E-commerce. We're excited to have you on board!</p>
            <p>With your new account, you can:</p>
            <ul>
              <li>Browse our wide selection of products</li>
              <li>Save items to your wishlist</li>
              <li>Track your orders</li>
              <li>Receive exclusive offers and discounts</li>
            </ul>
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
            <p>Happy shopping!</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>This email was sent to ${email}. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationEmail(name: string, orderId: string, orderTotal: number, items: Array<{ name: string; quantity: number; price: number }>): string {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for your order! We've received your order #${orderId} and it's being processed.</p>
            
            <h3>Order Summary</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 10px;">Order Total:</td>
                  <td style="text-align: right; padding: 10px;">$${orderTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <p>We'll send you another email when your order ships. You can track your order status in your account.</p>
            <p>If you have any questions about your order, please contact our support team.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>Order #${orderId} | Placed on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateShippingNotificationEmail(name: string, orderId: string, trackingNumber?: string, carrier?: string): string {
    const trackingInfo = trackingNumber ? `
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p><strong>Carrier:</strong> ${carrier || 'Standard Shipping'}</p>
      <p>You can track your package using the tracking number above on the carrier's website.</p>
    ` : `
      <p>Your order is on its way! We'll send you tracking information as soon as it becomes available.</p>
    `;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .tracking-box { background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order is on the Way!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Great news! Your order #${orderId} has shipped and is on its way to you.</p>
            
            <div class="tracking-box">
              <h3>Shipping Information</h3>
              ${trackingInfo}
            </div>
            
            <p><strong>Estimated Delivery:</strong> 3-7 business days</p>
            <p>You can view your order details and track your shipment from your account dashboard.</p>
            <p>If you have any questions about your shipment, please contact our support team.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>Order #${orderId} | Shipped on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetEmail(name: string, resetToken: string): string {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          .warning { color: #EF4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your AFORSEV account.</p>
            <p>Click the button below to reset your password:</p>
            <p>
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p><code>${resetLink}</code></p>
            <p class="warning">This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAbandonedCartEmail(name: string, cartItems: Array<{ name: string; price: number }>): string {
    const itemsHtml = cartItems.map(item => `
      <li>${item.name} - $${item.price.toFixed(2)}</li>
    `).join('');
    
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .cart-items { background-color: #fff8e1; border: 1px solid #ffecb3; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          .discount { color: #10B981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Don't Forget Your Items!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We noticed you left some items in your cart. They're waiting for you!</p>
            
            <div class="cart-items">
              <h3>Your Cart Items:</h3>
              <ul>
                ${itemsHtml}
              </ul>
              <p><strong>Cart Total: $${total.toFixed(2)}</strong></p>
            </div>
            
            <p>Complete your purchase now to secure these items before they're gone!</p>
            <p>
              <a href="${frontendUrl}/cart" class="button">Return to Cart</a>
            </p>
            <p class="discount">Use code <strong>CART10</strong> for 10% off your order!</p>
            <p>This offer is valid for the next 24 hours only.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>This email was sent because you left items in your cart. If you've already completed your purchase, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateCartNotificationAdminEmail(customerInfo: CustomerInfo, product: { name: string; price: number; quantity: number; imageUrl?: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .customer-box { background-color: #e8f4fd; border: 1px solid #b3d9f2; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .product-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          .label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Cart Activity Alert</h1>
          </div>
          <div class="content">
            <h2>Customer Added Item to Cart</h2>
            
            <div class="customer-box">
              <h3>Customer Information</h3>
              <p><span class="label">Name:</span> ${customerInfo.name}</p>
              <p><span class="label">Email:</span> <a href="mailto:${customerInfo.email}">${customerInfo.email}</a></p>
              ${customerInfo.phone ? `<p><span class="label">Phone:</span> <a href="tel:${customerInfo.phone}">${customerInfo.phone}</a></p>` : ''}
            </div>
            
            <div class="product-box">
              <h3>Product Added</h3>
              <p><span class="label">Product:</span> ${product.name}</p>
              <p><span class="label">Price:</span> $${product.price.toFixed(2)}</p>
              <p><span class="label">Quantity:</span> ${product.quantity}</p>
              <p><span class="label">Total Value:</span> <strong>$${(product.price * product.quantity).toFixed(2)}</strong></p>
            </div>
            
            <p>This customer is showing interest in your products. Consider reaching out to assist with their purchase.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>This is an automated notification from your e-commerce platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateNewOrderAdminEmail(customerInfo: CustomerInfo, orderId: string, orderTotal: number, items: CartItemInfo[]): string {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const addressHtml = customerInfo.shippingAddress ? `
      <p><span class="label">Address:</span> ${customerInfo.shippingAddress.street || ''}</p>
      <p><span class="label">City:</span> ${customerInfo.shippingAddress.city || ''}</p>
      <p><span class="label">State:</span> ${customerInfo.shippingAddress.state || ''}</p>
      <p><span class="label">Zip Code:</span> ${customerInfo.shippingAddress.zipCode || ''}</p>
      <p><span class="label">Country:</span> ${customerInfo.shippingAddress.country || ''}</p>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .customer-box { background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          .label { font-weight: bold; color: #555; }
          .badge { display: inline-block; background-color: #10B981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛍️ New Order Received!</h1>
            <p>Order #${orderId}</p>
          </div>
          <div class="content">
            <div class="customer-box">
              <h3>👤 Customer Details</h3>
              <p><span class="label">Name:</span> ${customerInfo.name}</p>
              <p><span class="label">Email:</span> <a href="mailto:${customerInfo.email}">${customerInfo.email}</a></p>
              ${customerInfo.phone ? `<p><span class="label">Phone:</span> <a href="tel:${customerInfo.phone}">${customerInfo.phone}</a></p>` : ''}
              ${addressHtml}
            </div>
            
            <h3>📦 Order Items</h3>
            <table class="order-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 10px;">Order Total:</td>
                  <td style="text-align: right; padding: 10px;">$${orderTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <p>Please process this order and prepare the items for shipment.</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>Order #${orderId} | Placed on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateEnhancedOrderConfirmationEmail(customerInfo: CustomerInfo, orderId: string, orderTotal: number, items: CartItemInfo[]): string {
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .order-table th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .info-box { background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you, ${customerInfo.name}!</h2>
            <p>Your order <strong>#${orderId}</strong> has been received and is being processed.</p>
            
            <div class="info-box">
              <h3>📋 Order Summary</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding: 10px;">Order Total:</td>
                    <td style="text-align: right; padding: 10px;">$${orderTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>📬 What Happens Next?</h3>
            <ol>
              <li>We'll prepare your items for shipment</li>
              <li>You'll receive a shipping confirmation with tracking information</li>
              <li>Your order will be delivered to your shipping address</li>
            </ol>
            
            <p>If you have any questions about your order, please reply to this email or contact our support team. We'll be happy to help!</p>
            <p><strong>The AFORSEV Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
            <p>Order #${orderId} | Placed on ${new Date().toLocaleDateString()}</p>
            <p>Contact us: support@aforsev.com | +1 (555) 123-4567</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}