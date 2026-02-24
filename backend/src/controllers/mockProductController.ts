import { Request, Response, NextFunction } from 'express';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Noise-cancelling over-ear headphones with 30-hour battery life',
    price: 129.99,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stock: 50,
    featured: true,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton t-shirt, available in multiple colors',
    price: 24.99,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w-400',
    stock: 100,
    featured: true,
    active: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated 1L water bottle, keeps drinks cold for 24 hours',
    price: 34.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400',
    stock: 75,
    featured: false,
    active: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '4',
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat with carrying strap',
    price: 49.99,
    category: 'Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    stock: 40,
    featured: true,
    active: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    category: 'Home & Kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    stock: 30,
    featured: false,
    active: true,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '6',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioning technology',
    price: 119.99,
    category: 'Footwear',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    stock: 60,
    featured: true,
    active: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
];

export class MockProductController {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const {
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice,
        featured,
        search,
      } = query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;

      // Filter products
      let filteredProducts = [...mockProducts];

      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      if (minPrice) {
        const min = parseFloat(minPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price >= min);
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        filteredProducts = filteredProducts.filter(p => p.price <= max);
      }

      if (featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }

      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const total = filteredProducts.length;
      const products = filteredProducts.slice(skip, skip + limitNum);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product by ID
   */
  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = mockProducts.find(p => p.id === id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const featuredProducts = mockProducts.filter(p => p.featured).slice(0, 6);
      
      res.json({
        success: true,
        data: featuredProducts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = Array.from(new Set(mockProducts.map(p => p.category)));
      
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}