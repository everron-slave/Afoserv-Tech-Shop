import axios from 'axios';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
  businessAccountId: string;
  apiVersion: string;
  baseUrl: string;
}

export const whatsappConfig: WhatsAppConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  apiVersion: 'v19.0', // Latest stable version as of 2026
  baseUrl: 'https://graph.facebook.com'
};

// Create axios instance for WhatsApp API
export const whatsappApi = axios.create({
  baseURL: `${whatsappConfig.baseUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`,
  headers: {
    'Authorization': `Bearer ${whatsappConfig.accessToken}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Validate configuration
export const validateWhatsAppConfig = () => {
  const missing: string[] = [];

  if (!whatsappConfig.accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
  if (!whatsappConfig.phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!whatsappConfig.verifyToken) missing.push('WHATSAPP_VERIFY_TOKEN');
  if (!whatsappConfig.businessAccountId) missing.push('WHATSAPP_BUSINESS_ACCOUNT_ID');

  if (missing.length > 0) {
    console.warn(`⚠️ WhatsApp configuration missing: ${missing.join(', ')}`);
    console.warn('WhatsApp features will be disabled until configured.');
    return false;
  }

  console.log('✅ WhatsApp configuration loaded successfully');
  return true;
};

// Message templates
export const messageTemplates = {
  cartShare: (cartItems: Array<{name: string, price: number, quantity: number}>, total: number) => {
    const itemsText = cartItems.map((item, index) =>
      `${index + 1}. ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}`
    ).join('\n');

    return `Hello! I'm interested in these items from AFORSEV:

${itemsText}

Total: $${total.toFixed(2)}

Can you help me with this order?`;
  },

  productInquiry: (product: {name: string, price: number, description?: string}) => {
    return `I'm interested in this product from AFORSEV:

${product.name}
$${product.price.toFixed(2)}
${product.description || ''}

Can you tell me more about this item?`;
  },

  orderConfirmation: (orderId: string, total: number, status: string) => {
    return `Your AFORSEV order #${orderId} has been confirmed!

Total: $${total.toFixed(2)}
Status: ${status}

Thank you for your purchase!`;
  },

  welcomeMessage: (name: string) => {
    return `Welcome to AFORSEV, ${name}! 🎉

Thank you for registering. We're excited to have you as a customer.

Here's what you can do:
• Browse our latest tech products
• Get help via WhatsApp anytime
• Track your orders
• Enjoy secure shopping

Need help? Just reply to this message!`;
  }
};