# AFORSEV E-commerce Email Notification System

## Overview
The email notification system for AFORSEV E-commerce platform has been implemented with support for 5 types of notifications:
1. Welcome emails for new users
2. Order confirmation emails
3. Shipping notifications
4. Password reset emails
5. Abandoned cart recovery emails

## Configuration

### Environment Variables
Update your `.env` file with the following email configuration:

```env
# Email Configuration (SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your_sendgrid_api_key"
FROM_EMAIL="noreply@aforsev.com"
FROM_NAME="AFORSEV E-commerce"

# Alternative: Use SendGrid API directly
SENDGRID_API_KEY="your_sendgrid_api_key_here"
```

### Dependencies Installed
- `nodemailer`: For SMTP email sending
- `@sendgrid/mail`: For SendGrid API integration
- `@types/nodemailer`: TypeScript definitions
- `@types/sendgrid`: TypeScript definitions

## Email Service Architecture

### Files Created
1. `src/config/email.ts` - Email configuration
2. `src/services/emailService.ts` - Core email service with template methods
3. `src/utils/email.ts` - Singleton email service utility
4. `src/utils/emailTemplates.ts` - Email template generators
5. `src/controllers/emailController.ts` - Email API controllers
6. `src/routes/email.ts` - Email API routes

### Integration Points
1. **Auth Controller**: Welcome emails on registration, password reset emails
2. **Order Controller**: Order confirmation and shipping notifications (to be fully integrated)
3. **Cart Service**: Abandoned cart recovery emails (to be implemented as a scheduled job)

## API Endpoints

### Email Testing & Management
- `GET /api/email/status` - Check email service status
- `POST /api/email/test` - Send a test email
- `POST /api/email/welcome` - Send welcome email (for testing)
- `POST /api/email/preview` - Preview email templates

### Authentication Endpoints (with email integration)
- `POST /api/auth/register` - Now sends welcome email
- `POST /api/auth/forgot-password` - Sends password reset email
- `POST /api/auth/reset-password` - Resets password with token

## Email Templates

### 1. Welcome Email
- **Trigger**: User registration
- **Template**: `generateWelcomeEmail()`
- **Content**: Welcome message, account features, support information

### 2. Order Confirmation Email
- **Trigger**: Order creation
- **Template**: `generateOrderConfirmationEmail()`
- **Content**: Order summary, items, total, next steps

### 3. Shipping Notification Email
- **Trigger**: Order shipment
- **Template**: `generateShippingNotificationEmail()`
- **Content**: Tracking information, estimated delivery, carrier details

### 4. Password Reset Email
- **Trigger**: Password reset request
- **Template**: `generatePasswordResetEmail()`
- **Content**: Reset link with token (expires in 1 hour)

### 5. Abandoned Cart Email
- **Trigger**: Cart abandonment (to be implemented as scheduled job)
- **Template**: `generateAbandonedCartEmail()`
- **Content**: Cart items, total, discount code, return to cart link

## Testing the Email System

### 1. Check Email Service Status
```bash
curl -X GET http://localhost:3000/api/email/status
```

### 2. Send Test Email
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Preview Email Template
```bash
curl -X POST http://localhost:3000/api/email/preview \
  -H "Content-Type: application/json" \
  -d '{"template": "welcome", "data": {"name": "John Doe"}}'
```

### 4. Test Registration with Welcome Email
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

## Production Considerations

### 1. Email Service Provider
- Currently configured for SendGrid (default)
- Can switch to any SMTP provider by updating environment variables
- Supports both SMTP and SendGrid API

### 2. Error Handling
- Email failures don't block user operations
- Errors are logged to console
- Graceful degradation when email service is unavailable

### 3. Security
- Password reset tokens expire in 1 hour
- No email enumeration in password reset flow
- Secure token generation using JWT

### 4. Performance
- Email sending is asynchronous
- Non-blocking operations
- Can be queued for better performance in production

## Next Steps for Production

1. **Implement email queue**: Use Redis or database queue for better reliability
2. **Add email analytics**: Track open rates, click-through rates
3. **Implement email templates in database**: Allow admin to edit templates
4. **Add unsubscribe functionality**: Compliance with email regulations
5. **Implement email scheduling**: For abandoned cart and promotional emails
6. **Add email validation**: Verify email addresses before sending
7. **Implement rate limiting**: Prevent email abuse

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check environment variables are set correctly
   - Verify SendGrid API key or SMTP credentials
   - Check console for error messages

2. **Email in spam folder**:
   - Configure SPF/DKIM/DMARC records
   - Use a verified domain with SendGrid
   - Avoid spam trigger words in content

3. **Template rendering issues**:
   - Check for unclosed HTML tags
   - Verify template variables are properly escaped
   - Test with preview endpoint first

### Logging
Email service logs to console with:
- Success: `Email sent successfully to [email]`
- Warning: `Email service is not configured. Skipping email send.`
- Error: `Failed to send email: [error]`