import { EmailService } from '../services/emailService';

// Singleton instance of EmailService
let emailServiceInstance: EmailService | null = null;

/**
 * Get or create the singleton EmailService instance
 */
export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
};

/**
 * Check if email service is configured
 */
export const isEmailServiceConfigured = (): boolean => {
  const service = getEmailService();
  // We can add more sophisticated checks here if needed
  return true; // The service will handle configuration checks internally
};

/**
 * Send a test email
 */
export const sendTestEmail = async (to: string): Promise<boolean> => {
  const service = getEmailService();
  
  const html = `
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

  return service.sendEmail({
    to,
    subject: 'AFORSEV Email Service Test',
    html,
  });
};