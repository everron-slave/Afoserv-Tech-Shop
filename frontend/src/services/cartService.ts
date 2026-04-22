import api from './api'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  priceAtTime?: number
  product?: {
    id: string
    name: string
    price: number
    imageUrl?: string
  }
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export const cartService = {
  // Get cart contents
  async getCart(): Promise<Cart> {
    const response = await api.get('/api/cart')
    return response.data.data
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const response = await api.post('/api/cart', { productId, quantity })
    return response.data.data
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await api.put(`/api/cart/items/${itemId}`, { quantity })
    return response.data.data
  },

  // Remove item from cart
  async removeCartItem(itemId: string): Promise<Cart> {
    const response = await api.delete(`/api/cart/items/${itemId}`)
    return response.data.data
  },

  // Clear cart
  async clearCart(): Promise<Cart> {
    const response = await api.delete('/api/cart')
    return response.data.data
  },

  // Sync local cart with server (for guest users)
  async syncCart(items: CartItem[]): Promise<Cart> {
    // This would be implemented differently in a real app
    // For now, we'll clear and re-add items
    await this.clearCart()
    
    // Add all items to cart
    for (const item of items) {
      await this.addToCart(item.productId, item.quantity)
    }
    
    return this.getCart()
  }
}