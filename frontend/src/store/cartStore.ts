import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService, CartItem as ApiCartItem, Cart as ApiCart } from '../services/cartService'

// Always use the real cart service that hits the backend API
const activeCartService = cartService

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartStore {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoading: boolean
  error: string | null
  sessionId: string | null
  
  // Local actions (for immediate UI feedback)
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setCart: (items: CartItem[]) => void
  
  // API actions (sync with backend)
  fetchCart: () => Promise<void>
  syncAddItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  syncUpdateQuantity: (productId: string, quantity: number) => Promise<void>
  syncRemoveItem: (productId: string) => Promise<void>
  syncClearCart: () => Promise<void>
}

// Helper function to transform API cart item to local cart item
const transformApiCartItem = (apiItem: ApiCartItem): CartItem => {
  return {
    id: apiItem.id,
    productId: apiItem.productId,
    name: apiItem.name || apiItem.product?.name || 'Unknown Product',
    price: apiItem.priceAtTime || apiItem.price || apiItem.product?.price || 0,
    quantity: apiItem.quantity,
    imageUrl: apiItem.imageUrl || apiItem.product?.imageUrl,
  }
}

// Helper function to transform API cart to local state
const transformApiCart = (apiCart: ApiCart): { items: CartItem[], totalItems: number, totalPrice: number, sessionId: string | null } => {
  const items = apiCart.items.map(transformApiCartItem)
  return {
    items,
    totalItems: apiCart.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: apiCart.totalAmount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    sessionId: (apiCart as any).sessionId || null,
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      sessionId: null,
      isLoading: false,
      error: null,

      // Local actions (for immediate UI feedback)
      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.productId === item.productId)
        
        if (existingItem) {
          // Update quantity if item exists
          const updatedItems = items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          })
        } else {
          // Add new item
          const newItem = { ...item, id: Date.now().toString() }
          const updatedItems = [...items, newItem]
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          })
        }
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get()
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }

        const updatedItems = items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        })
      },

      removeItem: (productId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item.productId !== productId)
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          totalPrice: updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        })
      },

      setCart: (items) => {
        set({
          items,
          totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
          totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        })
      },

      // API actions (sync with backend)
      fetchCart: async () => {
        set({ isLoading: true, error: null })
        try {
          const apiCart = await activeCartService.getCart()
          const transformed = transformApiCart(apiCart)
          set({
            ...transformed,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to fetch cart:', error)
          set({
            error: 'Failed to fetch cart from server',
            isLoading: false
          })
        }
      },

      syncAddItem: async (item: Omit<CartItem, 'id'>) => {
        set({ isLoading: true, error: null })
        try {
          // First update local state for immediate feedback
          get().addItem(item)
          
          // Then sync with server
          const apiCart = await activeCartService.addToCart(item.productId, item.quantity)
          const transformed = transformApiCart(apiCart)
          set({
            ...transformed,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to add item to cart:', error)
          set({
            error: 'Failed to add item to cart',
            isLoading: false
          })
          // Revert local changes on error
          get().removeItem(item.productId)
        }
      },

      syncUpdateQuantity: async (productId: string, quantity: number) => {
        set({ isLoading: true, error: null })
        try {
          // First update local state for immediate feedback
          get().updateQuantity(productId, quantity)
          
          // Find the cart item ID (this is simplified - in real app we'd need to map productId to cart item ID)
          const { items } = get()
          const cartItem = items.find(item => item.productId === productId)
          
          if (cartItem) {
            // In a real app, we'd use the cart item ID from the server
            // For now, we'll use a simplified approach
            const apiCart = await activeCartService.updateCartItem(cartItem.id, quantity)
            const transformed = transformApiCart(apiCart)
            set({
              ...transformed,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Failed to update cart item:', error)
          set({
            error: 'Failed to update cart item',
            isLoading: false
          })
        }
      },

      syncRemoveItem: async (productId: string) => {
        set({ isLoading: true, error: null })
        try {
          // Find the cart item ID
          const { items } = get()
          const cartItem = items.find(item => item.productId === productId)
          
          if (cartItem) {
            // First update local state for immediate feedback
            get().removeItem(productId)
            
            // Then sync with server
            const apiCart = await activeCartService.removeCartItem(cartItem.id)
            const transformed = transformApiCart(apiCart)
            set({
              ...transformed,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Failed to remove item from cart:', error)
          set({
            error: 'Failed to remove item from cart',
            isLoading: false
          })
        }
      },

      syncClearCart: async () => {
        set({ isLoading: true, error: null })
        try {
          // First update local state for immediate feedback
          get().clearCart()
          
          // Then sync with server
          const apiCart = await activeCartService.clearCart()
          const transformed = transformApiCart(apiCart)
          set({
            ...transformed,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to clear cart:', error)
          set({
            error: 'Failed to clear cart',
            isLoading: false
          })
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)