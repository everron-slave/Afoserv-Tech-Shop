import { create } from 'zustand'
import { Order, CreateOrderRequest, PaymentIntentRequest } from '../services/orderService'
import { orderService } from '../services/orderService'
import { mockOrderService } from '../services/mockOrderService'
import { withRetry } from '../utils/retry'
import { showApiErrorToast } from '../services/api'
import toast from 'react-hot-toast'

// Use mock service in development, real service in production
const isDevelopment = import.meta.env.MODE === 'development'
const activeOrderService = isDevelopment ? mockOrderService : orderService

interface OrderStore {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  
  // Actions
  createOrder: (orderData: CreateOrderRequest) => Promise<Order>
  getOrder: (orderId: string) => Promise<Order>
  getUserOrders: () => Promise<Order[]>
  getAllOrders: () => Promise<Order[]>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>
  createPaymentIntent: (paymentData: PaymentIntentRequest) => Promise<any>
  confirmPayment: (orderId: string, paymentIntentId: string) => Promise<Order>
  simulatePayment: (orderId: string, success?: boolean) => Promise<Order>
  clearCurrentOrder: () => void
  clearError: () => void
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (orderData: CreateOrderRequest) => {
    set({ isLoading: true, error: null })
    try {
      const createOrderWithRetry = withRetry(
        (data: CreateOrderRequest) => activeOrderService.createOrder(data),
        { maxAttempts: 2, delay: 1000 }
      )
      
      const order = await createOrderWithRetry(orderData)
      set({
        currentOrder: order,
        orders: [order, ...get().orders],
        isLoading: false
      })
      return order
    } catch (error) {
      console.error('Failed to create order:', error)
      const errorMessage = 'Failed to create order. Please check your cart and try again.'
      set({
        error: errorMessage,
        isLoading: false
      })
      showApiErrorToast(error, toast)
      throw error
    }
  },

  getOrder: async (orderId: string) => {
    set({ isLoading: true, error: null })
    try {
      const order = await activeOrderService.getOrder(orderId)
      set({
        currentOrder: order,
        isLoading: false
      })
      return order
    } catch (error) {
      console.error('Failed to get order:', error)
      set({
        error: 'Failed to get order',
        isLoading: false
      })
      throw error
    }
  },

  getUserOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const orders = await activeOrderService.getUserOrders()
      set({
        orders,
        isLoading: false
      })
      return orders
    } catch (error) {
      console.error('Failed to get user orders:', error)
      set({
        error: 'Failed to get user orders',
        isLoading: false
      })
      throw error
    }
  },

  getAllOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const orders = await activeOrderService.getAllOrders()
      set({
        orders,
        isLoading: false
      })
      return orders
    } catch (error) {
      console.error('Failed to get all orders:', error)
      set({
        error: 'Failed to get all orders',
        isLoading: false
      })
      throw error
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    set({ isLoading: true, error: null })
    try {
      const order = await activeOrderService.updateOrderStatus(orderId, status)
      
      // Update in orders list
      const updatedOrders = get().orders.map(o =>
        o.id === orderId ? order : o
      )
      
      // Update current order if it's the one being updated
      const currentOrder = get().currentOrder
      const updatedCurrentOrder = currentOrder?.id === orderId ? order : currentOrder
      
      set({
        orders: updatedOrders,
        currentOrder: updatedCurrentOrder,
        isLoading: false
      })
      
      return order
    } catch (error) {
      console.error('Failed to update order status:', error)
      set({
        error: 'Failed to update order status',
        isLoading: false
      })
      throw error
    }
  },

  createPaymentIntent: async (paymentData: PaymentIntentRequest) => {
    set({ isLoading: true, error: null })
    try {
      const paymentIntent = await activeOrderService.createPaymentIntent(paymentData)
      set({ isLoading: false })
      return paymentIntent
    } catch (error) {
      console.error('Failed to create payment intent:', error)
      set({
        error: 'Failed to create payment intent',
        isLoading: false
      })
      throw error
    }
  },

  confirmPayment: async (orderId: string, paymentIntentId: string) => {
    set({ isLoading: true, error: null })
    try {
      const order = await activeOrderService.confirmPayment(orderId, paymentIntentId)
      
      // Update in orders list
      const updatedOrders = get().orders.map(o =>
        o.id === orderId ? order : o
      )
      
      // Update current order
      set({
        orders: updatedOrders,
        currentOrder: order,
        isLoading: false
      })
      
      return order
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      set({
        error: 'Failed to confirm payment',
        isLoading: false
      })
      throw error
    }
  },

  simulatePayment: async (orderId: string, success: boolean = true) => {
    set({ isLoading: true, error: null })
    try {
      const simulatePaymentWithRetry = withRetry(
        (id: string, succ: boolean) => activeOrderService.simulatePayment(id, succ),
        { maxAttempts: 2, delay: 500 }
      )
      
      const order = await simulatePaymentWithRetry(orderId, success)
      
      // Update in orders list
      const updatedOrders = get().orders.map(o =>
        o.id === orderId ? order : o
      )
      
      // Update current order
      set({
        orders: updatedOrders,
        currentOrder: order,
        isLoading: false
      })
      
      if (success) {
        toast.success('Payment processed successfully!')
      } else {
        toast.error('Payment failed. Please try again.')
      }
      
      return order
    } catch (error) {
      console.error('Failed to simulate payment:', error)
      const errorMessage = 'Payment processing failed. Please try again or contact support.'
      set({
        error: errorMessage,
        isLoading: false
      })
      showApiErrorToast(error, toast)
      throw error
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null })
  },

  clearError: () => {
    set({ error: null })
  }
}))