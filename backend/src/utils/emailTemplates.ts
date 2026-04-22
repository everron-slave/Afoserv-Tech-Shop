/**
 * Email templates for AFORSEV E-commerce platform
 */

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  name: string;
  price: number;
}

/**
 * Generate welcome email HTML
 */
export const generateWelcomeEmail = (name: string, email: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
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
};

/**
 * Generate order confirmation email HTML
 */
export const generateOrderConfirmationEmail = (
  name: string, 
  orderId: string, 
  orderTotal: number, 
  items: OrderItem[]
): string => {
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
};

/**
 * Generate shipping notification email HTML
 */
export const generateShippingNotificationEmail = (
  name: string,
  orderId: string,
  trackingNumber?: string,
  carrier?: string
): string => {
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
};

/**
 * Generate password reset email HTML
 */
export const generatePasswordResetEmail = (
  name: string,
  resetToken: string,
  frontendUrl: string = 'http://localhost:5173'
): string => {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
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
};

/**
 * Generate abandoned cart email HTML
 */
export const generateAbandonedCartEmail = (
  name: string,
  cartItems: CartItem[],
  frontendUrl: string = 'http://localhost:5173'
): string => {
  const itemsHtml = cartItems.map(item => `
    <li>${item.name} - $${item.price.toFixed(2)}</li>
  `).join('');
  
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  
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
};

/**
 * Generate test email HTML
 */
export const generateTestEmail = (): string => {
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
          <h1>AFORSEV Email Test</h1>
        </div>
        <div class="content">
          <h2>Test Email Successful!</h2>
          <p>This is a test email from the AFORSEV E-commerce platform.</p>
          <p>If you're receiving this email, it means the email service is properly configured and working.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>The AFORSEV Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
          <p>This is an automated test email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};