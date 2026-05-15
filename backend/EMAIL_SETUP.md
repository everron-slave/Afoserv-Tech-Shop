# AFORSEV E-commerce Email Notification System

## Overview
The email notification system for AFORSEV E-commerce platform has been implemented with support for **8 types of notifications**:

| # | Notification Type | Recipient | Trigger | Status |
|---|------------------|-----------|---------|--------|
| 1 | Welcome Email | Customer | User registration | ✅ Active |
| 2 | Order Confirmation (Enhanced) | Customer | Order creation | ✅ Active |
| 3 | Shipping Notification | Customer | Order shipment | ✅ Active |
| 4 | Password Reset | Customer | Password reset request | ✅ Active |
| 5 | Abandoned Cart Recovery | Customer | Cart abandonment (scheduled) | 🔧 Scheduled |
| 6 | **Cart Activity Alert (Admin)** | **Admin** | **Item added to cart** | ✅ Active |
| 7 | **New Order Notification (Admin)** | **Admin** | **New order placed** | ✅ Active |
| 8 | **Enhanced Order Confirmation** | **Customer** | **Order creation (with full details)** | ✅ Active |

## Configuration

### Email Service: Gmail SMTP
The system uses **Gmail SMTP** via Nodemailer to send all emails. You need a Gmail account with an **App Password** (not your regular password).

#### How to Create a Gmail App Password
1. Go to your [Google Account Security](https://myaccount.google.com/security) page
2. **Enable 2-Step Verification** if not already enabled (required for App Passwords)
3. Search for **"App passwords"** in the Google Account search bar
4. Select **"Mail"** as the app and **"Other (Custom name)"** as the device (name it "AFORSEV E-commerce")
5. Click **Generate** — you'll receive a **16-character password**
6. Copy this password — you'll use it as `SMTP_PASSWORD`

### Environment Variables
Update your `.env` file with the following email configuration:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASSWORD="your_16_char_app_password"
FROM_EMAIL="your_email@gmail.com"
FROM_NAME="AFORSEV E-commerce"
ADMIN_EMAIL="admin@aforsev.com"
```

> **⚠️ Important**:
> - `SMTP_USER` must be your full Gmail address (e.g., `mybusiness@gmail.com`)
> - `SMTP_PASSWORD` must be the **16-character App Password** (no spaces), NOT your regular Gmail password
> - Gmail's SMTP port `587` uses STARTTLS (secure connection)
> - Gmail's free sending limit is approximately 500 recipients per day

### Dependencies Installed
- `nodemailer`: For SMTP email sending via Gmail
- `@types/nodemailer`: TypeScript definitions

## Email Service Architecture

### Files Created/Modified
1. `src/config/email.ts` - Email configuration (includes `adminEmail` field and `getAdminEmail()` export)
2. `src/services/emailService.ts` - Core email service with all template methods
3. `src/utils/email.ts` - Singleton email service utility
4. `src/utils/emailTemplates.ts` - Email template generators
5. `src/controllers/emailController.ts` - Email API controllers
6. `src/routes/email.ts` - Email API routes

### Integration Points
1. **Auth Controller**: Welcome emails on registration, password reset emails
2. **Cart Controller**: Sends cart activity alert to admin when a new item is added to cart
3. **Order Controller**: Sends enhanced order confirmation to customer AND new order notification to admin
4. **Cart Service**: Abandoned cart recovery emails (to be implemented as a scheduled job)

## API Endpoints

### Email Testing & Management
- `GET /api/email/status` - Check email service status
- `POST /api/email/test` - Send a test email
- `POST /api/email/welcome` - Send welcome email (for testing)
- `POST /api/email/preview` - Preview email templates

### Authentication Endpoints (with email integration)
- `POST /api/auth/register` - Sends welcome email
- `POST /api/auth/forgot-password` - Sends password reset email
- `POST /api/auth/reset-password` - Resets password with token

## Email Templates

### 1. Welcome Email
- **Trigger**: User registration
- **Template**: `generateWelcomeEmail()`
- **Recipient**: Customer
- **Content**: Welcome message, account features, support information

### 2. Enhanced Order Confirmation Email
- **Trigger**: Order creation
- **Template**: `generateEnhancedOrderConfirmationEmail()`
- **Recipient**: Customer
- **Content**: Personalized greeting, order summary table (items, qty, price, total), "What Happens Next?" steps, contact information
- **Features**: Indigo-themed header, itemized order table, next-steps guidance

### 3. Shipping Notification Email
- **Trigger**: Order shipment
- **Template**: `generateShippingNotificationEmail()`
- **Recipient**: Customer
- **Content**: Tracking information, estimated delivery, carrier details

### 4. Password Reset Email
- **Trigger**: Password reset request
- **Template**: `generatePasswordResetEmail()`
- **Recipient**: Customer
- **Content**: Reset link with token (expires in 1 hour)

### 5. Abandoned Cart Email
- **Trigger**: Cart abandonment (to be implemented as scheduled job)
- **Template**: `generateAbandonedCartEmail()`
- **Recipient**: Customer
- **Content**: Cart items, total, discount code, return to cart link

### 6. 🆕 Cart Activity Alert (Admin)
- **Trigger**: User adds item to cart (new item, not quantity update)
- **Template**: `generateCartNotificationAdminEmail()`
- **Recipient**: Admin (`ADMIN_EMAIL`)
- **Content**:
  - Customer information: name, email (clickable), phone (clickable)
  - Product details: name, price, quantity, total value
  - Call to action: "Consider reaching out to assist with their purchase"
- **Color Theme**: Blue (`#3B82F6`)

### 7. 🆕 New Order Notification (Admin)
- **Trigger**: New order placed
- **Template**: `generateNewOrderAdminEmail()`
- **Recipient**: Admin (`ADMIN_EMAIL`)
- **Content**:
  - Customer details: name, email (clickable), phone (clickable), full shipping address
  - Order items table: Item, Qty, Price, Total columns
  - Order total row
  - Action: "Please process this order and prepare the items for shipment"
- **Color Theme**: Green (`#10B981`)

### 8. 🆕 Enhanced Order Confirmation (Customer)
- **Trigger**: Order creation
- **Template**: `generateEnhancedOrderConfirmationEmail()`
- **Recipient**: Customer
- **Content**:
  - Personalized greeting with customer name
  - Order summary table with all items
  - "What Happens Next?" numbered steps
  - Support contact information
- **Color Theme**: Indigo (`#4F46E5`)

## Data Interfaces

The following TypeScript interfaces are used for type-safe email data:

```typescript
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
```

## Email Flow Diagrams

### Cart Addition Flow
```
User adds item to cart
        │
        ▼
  CartController.addToCart()
        │
        ├── New item? ──Yes──► EmailService.sendCartNotificationToAdmin()
        │                              │
        │                              ▼
        │                     Admin receives email with:
        │                     • Customer name, email, phone
        │                     • Product name, price, qty, total
        │
        └── Existing item? ──► Update quantity only (no email)
```

### Order Creation Flow
```
User places order
        │
        ▼
  OrderController.createOrder()
        │
        ├──► EmailService.sendEnhancedOrderConfirmationEmail()
        │         │
        │         ▼
        │    Customer receives:
        │    • Order summary table
        │    • Next steps
        │    • Contact info
        │
        └──► EmailService.sendNewOrderNotificationToAdmin()
                  │
                  ▼
             Admin receives:
             • Customer name, email, phone
             • Full shipping address
             • Order items with prices
             • Order total
```

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

### 5. Test Cart Notification (Admin)
```bash
# Add item to cart as authenticated user
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{"productId": "<product_id>", "quantity": 1}'
# → Admin receives email with customer and product info
```

### 6. Test Order Notifications (Admin + Customer)
```bash
# Place an order
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "CASH_ON_DELIVERY"
  }'
# → Customer receives order confirmation
# → Admin receives new order notification with customer details
```

## Production Considerations

### 1. Email Service Provider
- **Current**: Gmail SMTP via Nodemailer
- **Free tier**: Gmail allows ~500 recipients per day
- **Alternative**: Can switch to any SMTP provider (SendGrid, Mailgun, Amazon SES, Postmark) by updating `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD`

### 2. Error Handling
- Email failures don't block user operations (cart add, order creation)
- Errors are logged to console with descriptive messages
- Graceful degradation when email service is unavailable

### 3. Security
- Password reset tokens expire in 1 hour
- No email enumeration in password reset flow
- Secure token generation using JWT
- Admin email is configurable via environment variable
- Gmail App Passwords are more secure than using your regular password

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
8. **Add email preview in admin dashboard**: Allow admin to preview and test all templates
9. **Upgrade to dedicated email service**: For higher volume, consider SendGrid, Amazon SES, or Mailgun

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check environment variables are set correctly (`SMTP_USER`, `SMTP_PASSWORD`, `ADMIN_EMAIL`)
   - Verify the App Password is correct (16 characters, no spaces)
   - Ensure 2-Step Verification is enabled on the Gmail account
   - Check console for error messages
   - Run `curl -X GET http://localhost:3000/api/email/status` to verify configuration

2. **"Invalid login" or "Username and Password not accepted" error**:
   - You are using your regular Gmail password instead of an **App Password**
   - Generate an App Password at https://myaccount.google.com/apppasswords
   - Make sure 2-Step Verification is enabled first

3. **"Less secure apps" error**:
   - Google no longer supports "Less secure apps" access
   - You MUST use an App Password with 2-Step Verification enabled

4. **Email in spam folder**:
   - Configure SPF/DKIM/DMARC records for your domain
   - Use a custom domain with Google Workspace for better deliverability
   - Avoid spam trigger words in content

5. **Template rendering issues**:
   - Check for unclosed HTML tags
   - Verify template variables are properly escaped
   - Test with preview endpoint first

6. **Admin not receiving notifications**:
   - Verify `ADMIN_EMAIL` is set correctly in `.env`
   - Check that the email service is configured (`SMTP_USER` and `SMTP_PASSWORD`)
   - Look for "Error sending cart notification email" or "Error sending order notification emails" in console logs

### Logging
Email service logs to console with:
- Success: `Email sent successfully to [email]`
- Warning: `Email service is not configured. Skipping email send.`
- Error: `Failed to send email: [error]`
- Cart notification error: `Error sending cart notification email: [error]`
- Order notification error: `Error sending order notification emails: [error]`