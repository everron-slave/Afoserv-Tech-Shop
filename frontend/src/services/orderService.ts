import api from './api'

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Order {
  id: string
  userId?: string
  cartId?: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippingAddress?: string
  billingAddress?: string
  paymentMethod?: string
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  paymentIntentId?: string
  notes?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  cartId?: string
  customerName?: string
  email?: string
  phone?: string
  address?: string
  paymentMethod: string
}

export interface PaymentIntentRequest {
  orderId: string
  paymentMethod: string
  amount: number
  currency?: string
}

export interface PaymentIntentResponse {
  clientSecret?: string
  paymentIntentId: string
  status: string
  amount: number
  currency: string
}

export const orderService = {
  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Get session ID from cart store for guest checkout
    const { useCartStore } = await import('../store/cartStore')
    const sessionId = useCartStore.getState().sessionId
    
    const response = await api.post('/api/orders', orderData, {
      headers: sessionId ? { 'x-session-id': sessionId } : undefined
    })
    // The backend returns { message, order } format
    return response.data.order || response.data.data
  },

  // Get order by ID
  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get(`/api/orders/${orderId}`)
    return response.data.data
  },

  // Get user's orders
  async getUserOrders(userId?: string): Promise<Order[]> {
    const url = userId ? `/api/orders/user/${userId}` : '/api/orders/my'
    const response = await api.get(url)
    return response.data.data
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status })
    return response.data.data
  },

  // Create payment intent (for Stripe or other payment gateways)
  async createPaymentIntent(paymentData: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const response = await api.post('/api/orders/payment-intent', paymentData)
    return response.data.data
  },

  // Confirm payment
  async confirmPayment(orderId: string, paymentIntentId: string): Promise<Order> {
    const response = await api.post(`/api/orders/${orderId}/confirm-payment`, { paymentIntentId })
    return response.data.data
  },

  // Mock payment simulation (for development)
  async simulatePayment(orderId: string, success: boolean = true): Promise<Order> {
    const response = await api.post(`/api/orders/${orderId}/simulate-payment`, { success })
    return response.data.data
  },

  // Get order status
  async getOrderStatus(orderId: string): Promise<{ status: Order['status'], paymentStatus: Order['paymentStatus'] }> {
    const response = await api.get(`/api/orders/${orderId}/status`)
    return response.data.data
  },

  // Get all orders (admin only)
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get('/api/admin/orders')
    return response.data.data
  }
}