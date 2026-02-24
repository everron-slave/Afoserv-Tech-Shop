import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  }),
});

// Product validation schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
    featured: z.boolean().default(false),
  }),
});

export const updateProductSchema = createProductSchema.partial();

// Cart validation schemas
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().positive('Quantity must be positive').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
  params: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

// Order validation schemas
export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
    }),
    billingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
    }).optional(),
    paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer']).optional(),
    notes: z.string().optional(),
  }),
});

// WhatsApp validation schemas
export const shareCartSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    message: z.string().optional(),
  }),
});

export const shareProductSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    message: z.string().optional(),
  }),
});

// Query parameter schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('20').transform(Number),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const productFilterSchema = paginationSchema.extend({
  query: paginationSchema.shape.query.extend({
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
    featured: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
});

// Export all schemas
export const validators = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createProductSchema,
  updateProductSchema,
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  shareCartSchema,
  shareProductSchema,
  paginationSchema,
  productFilterSchema,
};