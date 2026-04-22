import { Request, Response } from 'express';
import { getEmailService, sendTestEmail, isEmailServiceConfigured } from '../utils/email';

/**
 * Send a test email
 */
export const sendTestEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    const success = await sendTestEmail(email);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check email configuration.',
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check email service status
 */
export const getEmailStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const isConfigured = isEmailServiceConfigured();
    
    res.status(200).json({
      success: true,
      data: {
        configured: isConfigured,
        service: 'AFORSEV Email Service',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Send welcome email (for testing)
 */
export const sendWelcomeEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
      return;
    }

    const service = getEmailService();
    const success = await service.sendWelcomeEmail(email, name);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Preview email template
 */
export const previewEmailTemplateHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { template, data } = req.body;
    
    if (!template) {
      res.status(400).json({
        success: false,
        message: 'Template name is required',
      });
      return;
    }

    const service = getEmailService();
    
    // Generate preview based on template type
    let previewHtml = '';
    let subject = '';
    
    switch (template) {
      case 'welcome':
        subject = 'Welcome to AFORSEV E-commerce!';
        previewHtml = `
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
                <h2>Hello ${data?.name || 'Customer'},</h2>
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
                <p>This is a preview of the welcome email template.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      case 'order-confirmation':
        subject = 'Order Confirmation - #ORD123456';
        previewHtml = `
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
                <h2>Hello ${data?.name || 'Customer'},</h2>
                <p>Thank you for your order! We've received your order #ORD123456 and it's being processed.</p>
                
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
                    <tr>
                      <td>Sample Product 1</td>
                      <td style="text-align: center;">2</td>
                      <td style="text-align: right;">$49.99</td>
                      <td style="text-align: right;">$99.98</td>
                    </tr>
                    <tr>
                      <td>Sample Product 2</td>
                      <td style="text-align: center;">1</td>
                      <td style="text-align: right;">$29.99</td>
                      <td style="text-align: right;">$29.99</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="3" style="text-align: right; padding: 10px;">Order Total:</td>
                      <td style="text-align: right; padding: 10px;">$129.97</td>
                    </tr>
                  </tbody>
                </table>
                
                <p>We'll send you another email when your order ships. You can track your order status in your account.</p>
                <p>If you have any questions about your order, please contact our support team.</p>
                <p><strong>The AFORSEV Team</strong></p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} AFORSEV E-commerce. All rights reserved.</p>
                <p>This is a preview of the order confirmation email template.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid template name. Available templates: welcome, order-confirmation, shipping, password-reset, abandoned-cart',
        });
        return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        template,
        subject,
        html: previewHtml,
        preview: true,
      },
    });
  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};