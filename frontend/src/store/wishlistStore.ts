import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl?: string
  addedAt: string
}

interface WishlistStore {
  items: WishlistItem[]
  isLoading: boolean
  
  // Actions
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void
  removeItem: (productId: string) => void
  moveToCart: (productId: string) => WishlistItem | null
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => {
        const { items } = get()
        
        // Check if item already exists in wishlist
        if (items.some(i => i.productId === item.productId)) {
          return
        }
        
        const newItem: WishlistItem = {
          ...item,
          id: `wishlist-${Date.now()}`,
          addedAt: new Date().toISOString()
        }
        
        set({
          items: [...items, newItem]
        })
      },

      removeItem: (productId) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.productId !== productId)
        set({ items: updatedItems })
      },

      moveToCart: (productId) => {
        const { items } = get()
        const itemIndex = items.findIndex(item => item.productId === productId)
        
        if (itemIndex === -1) {
          return null
        }
        
        const item = items[itemIndex]
        const updatedItems = items.filter((_, index) => index !== itemIndex)
        
        set({ items: updatedItems })
        return item
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      isInWishlist: (productId) => {
        const { items } = get()
        return items.some(item => item.productId === productId)
      }
    }),
    {
      name: 'wishlist-storage',
    }
  )
)