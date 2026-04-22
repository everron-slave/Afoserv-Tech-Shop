import { Order, CreateOrderRequest, PaymentIntentRequest, PaymentIntentResponse } from './orderService'

// Mock order data
const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    totalAmount: 3560.76,
    status: 'PROCESSING',
    shippingAddress: '123 Main St, New York, NY 10001, USA',
    billingAddress: '123 Main St, New York, NY 10001, USA',
    paymentMethod: 'credit_card',
    paymentStatus: 'PAID',
    paymentIntentId: 'pi_mock_123',
    notes: 'Please deliver before 5 PM',
    items: [
      {
        id: 'item-1-1',
        productId: '1',
        name: 'MacBook Pro 16"',
        price: 2499,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
      },
      {
        id: 'item-1-2',
        productId: '3',
        name: 'Sony WH-1000XM5',
        price: 399,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
      }
    ],
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-20T10:30:00Z'
  },
  {
    id: 'order-2',
    userId: 'user-2',
    totalAmount: 1088.91,
    status: 'SHIPPED',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001, USA',
    billingAddress: '456 Oak Ave, Los Angeles, CA 90001, USA',
    paymentMethod: 'paypal',
    paymentStatus: 'PAID',
    paymentIntentId: 'pi_mock_456',
    notes: 'Gift wrapping requested',
    items: [
      {
        id: 'item-2-1',
        productId: '2',
        name: 'iPhone 15 Pro',
        price: 999,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569'
      }
    ],
    createdAt: '2024-03-19T14:20:00Z',
    updatedAt: '2024-03-20T09:15:00Z'
  },
  {
    id: 'order-3',
    userId: 'user-3',
    totalAmount: 2481.84,
    status: 'DELIVERED',
    shippingAddress: '789 Pine Rd, Chicago, IL 60601, USA',
    billingAddress: '789 Pine Rd, Chicago, IL 60601, USA',
    paymentMethod: 'credit_card',
    paymentStatus: 'PAID',
    paymentIntentId: 'pi_mock_789',
    notes: '',
    items: [
      {
        id: 'item-3-1',
        productId: '4',
        name: 'Dell XPS 15',
        price: 2199,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5'
      },
      {
        id: 'item-3-2',
        productId: '5',
        name: 'Logitech MX Master 3',
        price: 99,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db'
      }
    ],
    createdAt: '2024-03-18T09:45:00Z',
    updatedAt: '2024-03-19T16:30:00Z'
  },
  {
    id: 'order-4',
    userId: 'user-4',
    totalAmount: 553.91,
    status: 'PENDING',
    shippingAddress: '321 Elm St, Houston, TX 77001, USA',
    billingAddress: '321 Elm St, Houston, TX 77001, USA',
    paymentMethod: 'credit_card',
    paymentStatus: 'PENDING',
    notes: 'Waiting for stock',
    items: [
      {
        id: 'item-4-1',
        productId: '6',
        name: 'Samsung 4K Monitor',
        price: 499,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1'
      }
    ],
    createdAt: '2024-03-25T08:15:00Z',
    updatedAt: '2024-03-25T08:15:00Z'
  },
  {
    id: 'order-5',
    userId: 'user-5',
    totalAmount: 699.84,
    status: 'CANCELLED',
    shippingAddress: '654 Maple Dr, Miami, FL 33101, USA',
    billingAddress: '654 Maple Dr, Miami, FL 33101, USA',
    paymentMethod: 'apple_pay',
    paymentStatus: 'REFUNDED',
    paymentIntentId: 'pi_mock_555',
    notes: 'Customer requested cancellation',
    items: [
      {
        id: 'item-5-1',
        productId: '7',
        name: 'Apple Watch Series 9',
        price: 399,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6'
      },
      {
        id: 'item-5-2',
        productId: '8',
        name: 'AirPods Pro',
        price: 249,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434'
      }
    ],
    createdAt: '2024-03-17T11:30:00Z',
    updatedAt: '2024-03-18T10:45:00Z'
  }
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockOrderService = {
  // Create a new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    await delay(300)
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: 'user-' + Math.floor(Math.random() * 1000),
      totalAmount: Math.floor(Math.random() * 5000) + 100,
      status: 'PENDING',
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'PENDING',
      notes: orderData.notes || '',
      items: [
        {
          id: `item-${Date.now()}-1`,
          productId: '1',
          name: 'Mock Product',
          price: 99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockOrders.unshift(newOrder)
    return newOrder
  },

  // Get a specific order
  async getOrder(orderId: string): Promise<Order> {
    await delay(200)
    
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }
    
    return order
  },

  // Get user's orders
  async getUserOrders(userId?: string): Promise<Order[]> {
    await delay(250)
    
    if (userId) {
      return mockOrders.filter(order => order.userId === userId)
    }
    
    // Return all orders for admin
    return [...mockOrders]
  },

  // Get all orders (admin only)
  async getAllOrders(): Promise<Order[]> {
    await delay(300)
    return [...mockOrders]
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    await delay(200)
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) {
      throw new Error(`Order not found: ${orderId}`)
    }
    
    const updatedOrder: Order = {
      ...mockOrders[orderIndex],
      status,
      updatedAt: new Date().toISOString()
    }
    
    mockOrders[orderIndex] = updatedOrder
    return updatedOrder
  },

  // Create payment intent
  async createPaymentIntent(paymentData: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    await delay(400)
    
    return {
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      paymentIntentId: `pi_${Date.now()}`,
      status: 'requires_payment_method',
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd'
    }
  },

  // Confirm payment
  async confirmPayment(orderId: string, paymentIntentId: string): Promise<Order> {
    await delay(300)
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) {
      throw new Error(`Order not found: ${orderId}`)
    }
    
    const updatedOrder: Order = {
      ...mockOrders[orderIndex],
      paymentStatus: 'PAID',
      status: 'PROCESSING',
      paymentIntentId,
      updatedAt: new Date().toISOString()
    }
    
    mockOrders[orderIndex] = updatedOrder
    return updatedOrder
  },

  // Simulate payment (for testing)
  async simulatePayment(orderId: string, success: boolean = true): Promise<Order> {
    await delay(300)
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId)
    if (orderIndex === -1) {
      throw new Error(`Order not found: ${orderId}`)
    }
    
    const updatedOrder: Order = {
      ...mockOrders[orderIndex],
      paymentStatus: success ? 'PAID' : 'FAILED',
      status: success ? 'PROCESSING' : 'PENDING',
      updatedAt: new Date().toISOString()
    }
    
    mockOrders[orderIndex] = updatedOrder
    return updatedOrder
  },

  // Get order status
  async getOrderStatus(orderId: string): Promise<{ status: Order['status'], paymentStatus: Order['paymentStatus'] }> {
    await delay(150)
    
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }
    
    return {
      status: order.status,
      paymentStatus: order.paymentStatus
    }
  }
}