import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { Cart, CartItem, Product } from '@prisma/client';

type CartWithItems = Cart & {
  items: (CartItem & {
    product: Pick<Product, 'id' | 'name' | 'description' | 'price' | 'category' | 'imageUrl' | 'stock'>;
  })[];
};

type CartItemWithRelations = CartItem & {
  cart: Cart;
  product: Product;
};

type CartItemWithProduct = CartItem & {
  product: Pick<Product, 'id' | 'name' | 'description' | 'price' | 'category' | 'imageUrl' | 'stock'>;
};

export class CartController {
  /**
   * Helper: Get or create cart for user/session
   */
  private static async getOrCreateCart(userId?: string, sessionId?: string): Promise<CartWithItems> {
    let cart: CartWithItems;

    if (userId) {
      // User cart - check if exists
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  category: true,
                  imageUrl: true,
                  stock: true,
                },
              },
            },
          },
        },
      }) as CartWithItems | null;

      if (!cart) {
        // Create new cart for user
        cart = await prisma.cart.create({
          data: {
            userId,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    imageUrl: true,
                    stock: true,
                  },
                },
              },
            },
          },
        });
      }
    } else if (sessionId) {
      // Guest cart - check if exists
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  category: true,
                  imageUrl: true,
                  stock: true,
                },
              },
            },
          },
        },
      }) as CartWithItems | null;

      if (!cart) {
        // Create new cart for guest
        cart = await prisma.cart.create({
          data: {
            sessionId,
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    imageUrl: true,
                    stock: true,
                  },
                },
              },
            },
          },
        });
      }
    } else {
      throw new Error('Either userId or sessionId is required');
    }

    return cart!;
  }

  /**
   * Helper: Generate session ID for guest users
   */
  private static generateSessionId() {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get cart contents
   */
  static async getCart(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);

      if (!userId && !sessionId) {
        // Create new session for guest
        const newSessionId = CartController.generateSessionId();

        res.cookie('sessionId', newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return empty cart
        return res.json({
          success: true,
          data: {
            id: null,
            items: [],
            totalItems: 0,
            totalPrice: 0,
            sessionId: newSessionId,
          },
        });
      }

      const cart = await CartController.getOrCreateCart(userId, sessionId as string);

      // Calculate totals
      const totalItems = cart.items.reduce((sum: number, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce(
        (sum: number, item) => sum + (Number(item.priceAtTime) * item.quantity),
        0
      );

      res.json({
        success: true,
        data: {
          id: cart.id,
          items: cart.items.map((item: any) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            priceAtTime: Number(item.priceAtTime),
            subtotal: Number(item.priceAtTime) * item.quantity,
          })),
          totalItems,
          totalPrice,
          sessionId: cart.sessionId,
          userId: cart.userId,
        },
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
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);
      const { productId, quantity = 1 } = req.body;

      // Validate product exists and is in stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          active: true,
        },
      });

      if (!product || !product.active) {
        const error = new Error('Product not found or unavailable');
        (error as any).statusCode = 404;
        (error as any).code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      if (product.stock < quantity) {
        const error = new Error('Insufficient stock');
        (error as any).statusCode = 400;
        (error as any).code = 'INSUFFICIENT_STOCK';
        throw error;
      }

      // Get or create cart
      let cart;
      if (userId || sessionId) {
        cart = await CartController.getOrCreateCart(userId, sessionId as string);
      } else {
        // Create new session for guest
        const newSessionId = CartController.generateSessionId();

        res.cookie('sessionId', newSessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        cart = await CartController.getOrCreateCart(undefined, newSessionId);
      }

      // Check if item already in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      let cartItem;
      if (existingItem) {
        // Update quantity
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
        });
      } else {
        // Add new item
        cartItem = await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            priceAtTime: product.price,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
        });
      }

      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });

      // Get updated cart with all items
      const updatedCart = await CartController.getOrCreateCart(userId, cart.sessionId ?? undefined);

      // Calculate totals
      const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCart.items.reduce(
        (sum: number, item) => sum + (Number(item.priceAtTime) * item.quantity),
        0
      );

      res.json({
        success: true,
        message: existingItem ? 'Cart item updated' : 'Item added to cart',
        data: {
          cartItem: {
            id: cartItem.id,
            product: cartItem.product,
            quantity: cartItem.quantity,
            priceAtTime: Number(cartItem.priceAtTime),
            subtotal: Number(cartItem.priceAtTime) * cartItem.quantity,
          },
          cart: {
            id: updatedCart.id,
            totalItems,
            totalPrice,
            sessionId: updatedCart.sessionId,
            userId: updatedCart.userId,
          },
        },
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
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);
      const itemId = req.params.itemId as string;
      const { quantity } = req.body;

      if (quantity < 1) {
        const error = new Error('Quantity must be at least 1');
        (error as any).statusCode = 400;
        (error as any).code = 'INVALID_QUANTITY';
        throw error;
      }

      // Get cart item
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
          cart: true,
          product: true,
        },
      }) as CartItemWithRelations | null;

      if (!cartItem) {
        const error = new Error('Cart item not found');
        (error as any).statusCode = 404;
        (error as any).code = 'CART_ITEM_NOT_FOUND';
        throw error;
      }

      // Verify cart ownership
      if (
        (userId && cartItem.cart.userId !== userId) ||
        (sessionId && cartItem.cart.sessionId !== null && cartItem.cart.sessionId !== sessionId)
      ) {
        const error = new Error('Unauthorized');
        (error as any).statusCode = 403;
        (error as any).code = 'UNAUTHORIZED';
        throw error;
      }

      // Check product stock
      if (cartItem.product.stock < quantity) {
        const error = new Error('Insufficient stock');
        (error as any).statusCode = 400;
        (error as any).code = 'INSUFFICIENT_STOCK';
        throw error;
      }

      // Update quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              category: true,
              imageUrl: true,
              stock: true,
            },
          },
        },
      }) as CartItemWithProduct;

      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { updatedAt: new Date() },
      });

      // Get updated cart
      const cart = await CartController.getOrCreateCart(userId, sessionId as string);

      // Calculate totals
      const totalItems = cart.items.reduce((sum: number, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce(
        (sum: number, item) => sum + (Number(item.priceAtTime) * item.quantity),
        0
      );

      res.json({
        success: true,
        message: 'Cart item updated',
        data: {
          cartItem: {
            id: updatedCartItem.id,
            product: updatedCartItem.product,
            quantity: updatedCartItem.quantity,
            priceAtTime: Number(updatedCartItem.priceAtTime),
            subtotal: Number(updatedCartItem.priceAtTime) * updatedCartItem.quantity,
          },
          cart: {
            id: cart.id,
            totalItems,
            totalPrice,
            sessionId: cart.sessionId,
            userId: cart.userId,
          },
        },
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
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);
      const itemId = req.params.itemId as string;

      // Get cart item
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: {
          cart: true,
        },
      });

      if (!cartItem) {
        const error = new Error('Cart item not found');
        (error as any).statusCode = 404;
        (error as any).code = 'CART_ITEM_NOT_FOUND';
        throw error;
      }

      // Verify cart ownership
      if (
        (userId && cartItem.cart.userId !== userId) ||
        (sessionId && cartItem.cart.sessionId !== null && cartItem.cart.sessionId !== sessionId)
      ) {
        const error = new Error('Unauthorized');
        (error as any).statusCode = 403;
        (error as any).code = 'UNAUTHORIZED';
        throw error;
      }

      // Remove item
      await prisma.cartItem.delete({
        where: { id: itemId },
      });

      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { updatedAt: new Date() },
      });

      // Get updated cart
      const cart = await CartController.getOrCreateCart(userId, sessionId as string);

      // Calculate totals
      const totalItems = cart.items.reduce((sum: number, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce(
        (sum: number, item) => sum + (Number(item.priceAtTime) * item.quantity),
        0
      );

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
          cart: {
            id: cart.id,
            totalItems,
            totalPrice,
            sessionId: cart.sessionId,
            userId: cart.userId,
          },
        },
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
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);

      const cart = await CartController.getOrCreateCart(userId, sessionId as string);

      // Remove all items
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Update cart timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: { updatedAt: new Date() },
      });

      res.json({
        success: true,
        message: 'Cart cleared',
        data: {
          cart: {
            id: cart.id,
            totalItems: 0,
            totalPrice: 0,
            sessionId: cart.sessionId,
            userId: cart.userId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Merge guest cart with user cart on login
   */
  static async mergeCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const headerSessionId = req.headers['x-session-id'];
      const sessionId = req.cookies?.sessionId ||
        (Array.isArray(headerSessionId) ? headerSessionId[0] : headerSessionId);

      if (!sessionId) {
        return res.json({
          success: true,
          message: 'No guest cart to merge',
        });
      }

      // Get guest cart
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: true,
        },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return res.json({
          success: true,
          message: 'Guest cart is empty',
        });
      }

      // Get or create user cart
      const userCart = await CartController.getOrCreateCart(userId, undefined);

      // Merge items
      for (const guestItem of guestCart.items) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId: guestItem.productId,
          },
        });

        if (existingItem) {
          // Update quantity
          await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + guestItem.quantity,
            },
          });
        } else {
          // Add new item
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              priceAtTime: guestItem.priceAtTime,
            },
          });
        }
      }

      // Delete guest cart
      await prisma.cart.delete({
        where: { id: guestCart.id },
      });

      // Clear session cookie
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Get updated user cart
      const updatedCart = await CartController.getOrCreateCart(userId, undefined);

      // Calculate totals
      const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCart.items.reduce(
        (sum: number, item) => sum + (Number(item.priceAtTime) * item.quantity),
        0
      );

      res.json({
        success: true,
        message: 'Cart merged successfully',
        data: {
          cart: {
            id: updatedCart.id,
            totalItems,
            totalPrice,
            userId: updatedCart.userId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}