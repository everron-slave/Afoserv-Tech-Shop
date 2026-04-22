import { Cart, CartItem } from './cartService'

// Mock cart data
let mockCart: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      id: 'cart-item-1',
      productId: '1',
      name: 'MacBook Pro 16"',
      price: 2499,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      priceAtTime: 2499,
      product: {
        id: '1',
        name: 'MacBook Pro 16"',
        price: 2499,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
      }
    },
    {
      id: 'cart-item-2',
      productId: '3',
      name: 'Sony WH-1000XM5',
      price: 399,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      priceAtTime: 399,
      product: {
        id: '3',
        name: 'Sony WH-1000XM5',
        price: 399,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
      }
    }
  ],
  totalItems: 3,
  totalAmount: 3297
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to calculate cart totals
const calculateCartTotals = (items: CartItem[]): { totalItems: number, totalAmount: number } => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return { totalItems, totalAmount }
}

export const mockCartService = {
  // Get cart contents
  async getCart(): Promise<Cart> {
    await delay(200)
    
    // Update totals in case they're out of sync
    const { totalItems, totalAmount } = calculateCartTotals(mockCart.items)
    mockCart.totalItems = totalItems
    mockCart.totalAmount = totalAmount
    
    return { ...mockCart }
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    await delay(300)
    
    // Check if item already exists in cart
    const existingItemIndex = mockCart.items.findIndex(item => item.productId === productId)
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      mockCart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}`,
        productId,
        name: `Product ${productId}`,
        price: Math.floor(Math.random() * 1000) + 50, // Mock price
        quantity,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        priceAtTime: Math.floor(Math.random() * 1000) + 50,
        product: {
          id: productId,
          name: `Product ${productId}`,
          price: Math.floor(Math.random() * 1000) + 50,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
        }
      }
      mockCart.items.push(newItem)
    }
    
    // Update totals
    const { totalItems, totalAmount } = calculateCartTotals(mockCart.items)
    mockCart.totalItems = totalItems
    mockCart.totalAmount = totalAmount
    
    return { ...mockCart }
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    await delay(250)
    
    const itemIndex = mockCart.items.findIndex(item => item.id === itemId)
    
    if (itemIndex === -1) {
      throw new Error(`Cart item not found: ${itemId}`)
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      mockCart.items.splice(itemIndex, 1)
    } else {
      // Update quantity
      mockCart.items[itemIndex].quantity = quantity
    }
    
    // Update totals
    const { totalItems, totalAmount } = calculateCartTotals(mockCart.items)
    mockCart.totalItems = totalItems
    mockCart.totalAmount = totalAmount
    
    return { ...mockCart }
  },

  // Remove item from cart
  async removeCartItem(itemId: string): Promise<Cart> {
    await delay(200)
    
    const itemIndex = mockCart.items.findIndex(item => item.id === itemId)
    
    if (itemIndex === -1) {
      throw new Error(`Cart item not found: ${itemId}`)
    }
    
    // Remove item
    mockCart.items.splice(itemIndex, 1)
    
    // Update totals
    const { totalItems, totalAmount } = calculateCartTotals(mockCart.items)
    mockCart.totalItems = totalItems
    mockCart.totalAmount = totalAmount
    
    return { ...mockCart }
  },

  // Clear cart
  async clearCart(): Promise<Cart> {
    await delay(300)
    
    // Clear all items
    mockCart.items = []
    mockCart.totalItems = 0
    mockCart.totalAmount = 0
    
    return { ...mockCart }
  },

  // Sync local cart with server (for guest users)
  async syncCart(items: CartItem[]): Promise<Cart> {
    await delay(400)
    
    // Replace cart items with provided items
    mockCart.items = items.map(item => ({
      ...item,
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      priceAtTime: item.price,
      product: item.product || {
        id: item.productId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl
      }
    }))
    
    // Update totals
    const { totalItems, totalAmount } = calculateCartTotals(mockCart.items)
    mockCart.totalItems = totalItems
    mockCart.totalAmount = totalAmount
    
    return { ...mockCart }
  },

  // Get cart item count (quick count without full cart data)
  async getCartItemCount(): Promise<number> {
    await delay(100)
    return mockCart.totalItems
  },

  // Apply coupon code
  async applyCoupon(code: string): Promise<{ success: boolean; message: string; discountAmount?: number }> {
    await delay(300)
    
    const validCoupons = {
      'WELCOME10': 0.1, // 10% discount
      'SAVE20': 0.2,    // 20% discount
      'FREESHIP': 0,    // Free shipping (handled differently)
      'SUMMER25': 0.25  // 25% discount
    }
    
    if (code in validCoupons) {
      const discountRate = validCoupons[code as keyof typeof validCoupons]
      const discountAmount = mockCart.totalAmount * discountRate
      
      return {
        success: true,
        message: `Coupon "${code}" applied successfully!`,
        discountAmount
      }
    }
    
    return {
      success: false,
      message: `Invalid coupon code: "${code}"`
    }
  },

  // Remove coupon
  async removeCoupon(): Promise<Cart> {
    await delay(150)
    // In a real implementation, this would remove any applied coupon
    // For mock, just return current cart
    return { ...mockCart }
  },

  // Get shipping options
  async getShippingOptions(_address: string): Promise<Array<{
    id: string;
    name: string;
    price: number;
    estimatedDays: number;
  }>> {
    await delay(250)
    
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        price: 5.99,
        estimatedDays: 5
      },
      {
        id: 'express',
        name: 'Express Shipping',
        price: 12.99,
        estimatedDays: 2
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        price: 24.99,
        estimatedDays: 1
      },
      {
        id: 'free',
        name: 'Free Shipping',
        price: 0,
        estimatedDays: 7
      }
    ]
  }
}