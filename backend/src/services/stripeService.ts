import Stripe from 'stripe';
import prisma from '../config/database';

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as any, // Use latest stable API version
});

export interface CreatePaymentIntentParams {
  orderId: string;
  amount: number; // Amount in smallest currency unit (e.g., cents for USD)
  currency?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ConfirmPaymentParams {
  orderId: string;
  paymentIntentId: string;
}

export class StripeService {
  /**
   * Create a payment intent for an order
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    try {
      const { orderId, amount, currency = 'usd', metadata = {} } = params;

      // Verify the order exists and is in a valid state
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.paymentStatus === 'PAID') {
        throw new Error(`Order ${orderId} is already paid`);
      }

      if (order.status === 'CANCELLED') {
        throw new Error(`Order ${orderId} is cancelled`);
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe expects amount in smallest currency unit
        currency,
        metadata: {
          orderId,
          ...metadata
        },
        // For card payments, we can add additional options
        payment_method_types: ['card'],
        // Optional: setup for future payments
        setup_future_usage: 'off_session',
      });

      // Update order with payment intent ID
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'PENDING'
        }
      });

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment and update order status
   */
  static async confirmPayment(params: ConfirmPaymentParams): Promise<any> {
    try {
      const { orderId, paymentIntentId } = params;

      // Retrieve the payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
        throw new Error(`Payment intent ${paymentIntentId} not found`);
      }

      // Verify payment intent status
      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment intent ${paymentIntentId} has status ${paymentIntent.status}, expected 'succeeded'`);
      }

      // Verify the payment intent belongs to the order
      if (paymentIntent.metadata.orderId !== orderId) {
        throw new Error(`Payment intent ${paymentIntentId} does not belong to order ${orderId}`);
      }

      // Update order with successful payment
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentIntentId: paymentIntent.id,
          status: 'PROCESSING' // Move to processing after payment
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Update product stock (inventory management)
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return {
        order,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhookEvent(payload: any, signature: string): Promise<void> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
      }

      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  private static async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('Payment intent missing orderId metadata');
      return;
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          paymentIntentId: paymentIntent.id,
          status: 'PROCESSING'
        }
      });

      console.log(`Order ${orderId} marked as paid via webhook`);
    } catch (error) {
      console.error(`Error updating order ${orderId} from webhook:`, error);
    }
  }

  /**
   * Handle failed payment intent
   */
  private static async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.warn('Payment intent missing orderId metadata');
      return;
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          paymentIntentId: paymentIntent.id,
          status: 'PENDING'
        }
      });

      console.log(`Order ${orderId} marked as failed via webhook`);
    } catch (error) {
      console.error(`Error updating order ${orderId} from webhook:`, error);
    }
  }

  /**
   * Handle charge refund
   */
  private static async handleChargeRefunded(charge: any): Promise<void> {
    const orderId = charge.metadata.orderId;
    
    if (!orderId) {
      console.warn('Charge missing orderId metadata');
      return;
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED'
        }
      });

      console.log(`Order ${orderId} marked as refunded via webhook`);
    } catch (error) {
      console.error(`Error updating order ${orderId} from webhook:`, error);
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        created: paymentIntent.created
      };
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount) : undefined
      });

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
}