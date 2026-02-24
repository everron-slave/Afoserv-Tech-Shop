import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setCart: (items: CartItem[]) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

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
    }),
    {
      name: 'cart-storage',
    }
  )
)