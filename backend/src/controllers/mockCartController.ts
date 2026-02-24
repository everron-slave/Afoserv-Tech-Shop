import { Request, Response, NextFunction } from 'express';

// Mock cart data
const mockCarts: Record<string, any> = {
  'user-1': {
    id: 'cart-1',
    userId: '1',
    items: [
      {
        id: 'cart-item-1',
        productId: '1',
        quantity: 2,
        priceAtTime: 129.99,
        product: {
          id: '1',
          name: 'Wireless Bluetooth Headphones',
          price: 129.99,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        },
      },
      {
        id: 'cart-item-2',
        productId: '2',
        quantity: 1,
        priceAtTime: 24.99,
        product: {
          id: '2',
          name: 'Organic Cotton T-Shirt',
          price: 24.99,
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w-400',
        },
      },
    ],
    totalItems: 3,
    totalAmount: 284.97,
  },
};

export class MockCartController {
  /**
   * Get user's cart
   */
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app, we would get userId from auth middleware
      const userId = 'user-1'; // Mock user ID for now
      
      const cart = mockCarts[userId] || {
        id: `cart-${Date.now()}`,
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = 'user-1'; // Mock user ID

      // Mock product data
      const mockProducts = [
        {
          id: '1',
          name: 'Wireless Bluetooth Headphones',
          price: 129.99,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        },
        {
          id: '2',
          name: 'Organic Cotton T-Shirt',
          price: 24.99,
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w-400',
        },
        {
          id: '3',
          name: 'Stainless Steel Water Bottle',
          price: 34.99,
          imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400',
        },
      ];

      const product = mockProducts.find(p => p.id === productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      let cart = mockCarts[userId];
      if (!cart) {
        cart = {
          id: `cart-${Date.now()}`,
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        };
        mockCarts[userId] = cart;
      }

      // Check if item already in cart
      const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          id: `cart-item-${Date.now()}`,
          productId,
          quantity,
          priceAtTime: product.price,
          product,
        });
      }

      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      cart.totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.priceAtTime * item.quantity), 0);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = 'user-1'; // Mock user ID

      const cart = mockCarts[userId];
      if (!cart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
      }

      const itemIndex = cart.items.findIndex((item: any) => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Cart item not found',
        });
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      cart.totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.priceAtTime * item.quantity), 0);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = 'user-1'; // Mock user ID

      const cart = mockCarts[userId];
      if (!cart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
      }

      const itemIndex = cart.items.findIndex((item: any) => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Cart item not found',
        });
      }

      // Remove item
      cart.items.splice(itemIndex, 1);

      // Recalculate totals
      cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      cart.totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.priceAtTime * item.quantity), 0);

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = 'user-1'; // Mock user ID

      const cart = mockCarts[userId];
      if (!cart) {
        return res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
      }

      // Clear all items
      cart.items = [];
      cart.totalItems = 0;
      cart.totalAmount = 0;

      res.json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}