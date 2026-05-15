import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { StripeService } from '../services/stripeService';
import { getEmailService } from '../utils/email';
import { getAdminEmail } from '../config/email';

export class OrderController {
  /**
   * Create a new order from cart
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        customerName,
        email,
        phone,
        address,
        paymentMethod,
        cartId
      } = req.body;

      const userId = (req as any).user?.id;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);

      // Debug logging — REMOVE AFTER VERIFICATION
      console.log('[DEBUG createOrder] req.cookies:', req.cookies);
      console.log('[DEBUG createOrder] x-session-id header:', headerSessionId);
      console.log('[DEBUG createOrder] resolved sessionId:', sessionId);
      console.log('[DEBUG createOrder] userId:', userId);
      console.log('[DEBUG createOrder] cartId from body:', cartId);

      // Find the cart by userId (authenticated), sessionId (guest from cookie/header), or cartId (explicit)
      let cartQuery: any = null;

      if (userId) {
        cartQuery = { userId };
      } else if (sessionId) {
        cartQuery = { sessionId };
      } else if (cartId && cartId !== 'current') {
        cartQuery = { id: cartId };
      }

      console.log('[DEBUG createOrder] cartQuery:', JSON.stringify(cartQuery));

      if (!cartQuery) {
        return res.status(400).json({
          error: 'No cart found. Please add items to your cart before checkout.'
        });
      }

      // Get cart with items
      const cart = await prisma.cart.findFirst({
        where: cartQuery,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          error: 'Cart is empty or not found'
        });
      }

      // Validate inventory before creating order
      const outOfStockItems = [];
      for (const item of cart.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        });
        
        if (product && product.stock < item.quantity) {
          outOfStockItems.push({
            productId: item.productId,
            productName: product.name,
            requested: item.quantity,
            available: product.stock
          });
        }
      }

      if (outOfStockItems.length > 0) {
        return res.status(400).json({
          error: 'Some items are out of stock or insufficient quantity',
          outOfStockItems
        });
      }

      // Calculate total amount
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + (item.priceAtTime * item.quantity);
      }, 0);

      // Build notes with customer info for record-keeping
      const notes = customerName || email || phone
        ? `Customer: ${customerName || 'Guest'}, Email: ${email || 'N/A'}, Phone: ${phone || 'N/A'}`
        : '';

      // For guest users, create or find a guest user record
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        // Use a generic guest user for guest checkouts
        const guestUser = await prisma.user.upsert({
          where: { email: 'guest@aforsev.com' },
          update: {},
          create: {
            email: 'guest@aforsev.com',
            passwordHash: 'guest-no-login',
            name: customerName || 'Guest',
            role: 'GUEST',
          },
        });
        resolvedUserId = guestUser.id;
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: resolvedUserId,
          cartId: cart.id,
          totalAmount,
          status: 'PENDING',
          shippingAddress: address || '',
          billingAddress: address || '',
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          paymentStatus: 'PENDING',
          notes,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.priceAtTime
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Clear the cart after order creation
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // Send email notifications
      try {
        // Format order items for email
        const orderItems = order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          productId: item.productId,
          imageUrl: item.product.imageUrl || undefined,
        }));

        // Use customer info from request body (for guest checkout) or from DB (for authenticated users)
        let resolvedCustomerName = customerName || 'Guest';
        let resolvedCustomerEmail = email || '';
        let resolvedCustomerPhone = phone || '';

        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, phone: true, role: true }
          });
          if (user && user.role !== 'GUEST') {
            resolvedCustomerName = user.name || resolvedCustomerName;
            resolvedCustomerEmail = user.email || resolvedCustomerEmail;
            resolvedCustomerPhone = user.phone || resolvedCustomerPhone;
          }
        }

        const customerInfo = {
          name: resolvedCustomerName,
          email: resolvedCustomerEmail,
          phone: resolvedCustomerPhone,
          shippingAddress: address ? {
            street: address,
            city: '',
            state: '',
            zipCode: '',
            country: '',
          } : undefined,
        };

        // 1. Send enhanced order confirmation to customer
        const emailSvc = getEmailService();
        if (resolvedCustomerEmail) {
          await emailSvc.sendEnhancedOrderConfirmationEmail(
            resolvedCustomerEmail,
            customerInfo,
            order.id,
            totalAmount,
            orderItems
          );
        }

        // 2. Send new order notification to admin
        const adminEmail = getAdminEmail();
        await emailSvc.sendNewOrderNotificationToAdmin(
          adminEmail,
          customerInfo,
          order.id,
          totalAmount,
          orderItems
        );
      } catch (emailError) {
        console.error('Error sending order notification emails:', emailError);
        // Don't fail the order creation if email fails
      }

      return res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return next(error);
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const userId = (req as any).user?.id;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization (user can only see their own orders unless admin)
      const isAdmin = (req as any).user?.role === 'ADMIN';
      if (!isAdmin && order.userId !== userId && order.userId !== 'guest') {
        return res.status(403).json({ error: 'Unauthorized to view this order' });
      }

      return res.json({ order });
    } catch (error) {
      console.error('Error getting order:', error);
      return next(error);
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { status, limit = 20, offset = 0 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      });

      const total = await prisma.order.count({ where });

      return res.json({
        orders,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + orders.length < total
        }
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      return next(error);
    }
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const { status } = req.body;

      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return res.json({
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return next(error);
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const { paymentStatus, paymentIntentId } = req.body;

      const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          error: 'Invalid payment status. Must be one of: ' + validStatuses.join(', ')
        });
      }

      const updateData: any = { paymentStatus };
      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return res.json({
        message: 'Payment status updated successfully',
        order
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      return next(error);
    }
  }

  /**
   * Get all orders (admin only)
   */
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, userId, limit = 50, offset = 0 } = req.query;

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (userId) {
        where.userId = userId;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      });

      const total = await prisma.order.count({ where });

      return res.json({
        orders,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + orders.length < total
        }
      });
    } catch (error) {
      console.error('Error getting all orders:', error);
      return next(error);
    }
  }

  /**
   * Create payment intent (for Stripe integration)
   */
  static async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount, currency = 'usd' } = req.body;

      // Use real Stripe service
      const result = await StripeService.createPaymentIntent({
        orderId,
        amount: Math.round(amount * 100), // Convert to cents
        currency
      });

      return res.json(result);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return next(error);
    }
  }

  /**
   * Confirm payment (for Stripe integration)
   */
  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const { paymentIntentId } = req.body;

      // Use real Stripe service to confirm payment
      const result = await StripeService.confirmPayment({
        orderId,
        paymentIntentId
      });

      return res.json({
        message: 'Payment confirmed successfully',
        ...result
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      return next(error);
    }
  }

  /**
   * Simulate payment (for testing)
   */
  static async simulatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const { success = true } = req.body;

      const paymentStatus = success ? 'PAID' : 'FAILED';
      const orderStatus = success ? 'PROCESSING' : 'PENDING';

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          status: orderStatus,
          paymentIntentId: success ? `test_pi_${Date.now()}` : null
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return res.json({
        message: success ? 'Payment simulated successfully' : 'Payment simulation failed',
        order
      });
    } catch (error) {
      console.error('Error simulating payment:', error);
      return next(error);
    }
  }
}