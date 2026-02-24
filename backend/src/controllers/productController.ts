import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { productFilterSchema } from '../utils/validators';
import { validate } from '../middleware/validation';

export class ProductController {
  /**
   * Get all products with filtering and pagination
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;

      // Parse and validate query parameters
      const {
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice,
        featured,
        search,
        sort = 'createdAt',
        order = 'desc',
      } = query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const where: any = {
        active: true,
      };

      if (category) {
        where.category = category;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
          where.price.gte = parseFloat(minPrice as string);
        }
        if (maxPrice) {
          where.price.lte = parseFloat(maxPrice as string);
        }
      }

      if (featured === 'true') {
        where.featured = true;
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { category: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Build orderBy
      const orderBy: any = {};
      const sortField = sort as string;
      const sortOrder = order as 'asc' | 'desc';

      // Validate sort field to prevent SQL injection
      const validSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(sortField)) {
        orderBy[sortField] = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Execute queries in parallel
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limitNum,
          orderBy,
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            category: true,
            imageUrl: true,
            stock: true,
            featured: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
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
      const id = req.params.id as string;

      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          stock: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!product) {
        const error = new Error('Product not found');
        (error as any).statusCode = 404;
        (error as any).code = 'PRODUCT_NOT_FOUND';
        throw error;
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
   * Create new product (Admin only)
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, category, imageUrl, stock, featured } = req.body;

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          category,
          imageUrl,
          stock: parseInt(stock) || 0,
          featured: featured || false,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          stock: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product (Admin only)
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { name, description, price, category, imageUrl, stock, featured } = req.body;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        const error = new Error('Product not found');
        (error as any).statusCode = 404;
        (error as any).code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price && { price }),
          ...(category && { category }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
          ...(featured !== undefined && { featured }),
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          stock: true,
          featured: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product (Admin only)
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        const error = new Error('Product not found');
        (error as any).statusCode = 404;
        (error as any).code = 'PRODUCT_NOT_FOUND';
        throw error;
      }

      // Soft delete by setting active to false
      await prisma.product.update({
        where: { id },
        data: { active: false },
      });

      res.json({
        success: true,
        message: 'Product deleted successfully',
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
      const categories = await prisma.product.findMany({
        where: { active: true },
        distinct: ['category'],
        select: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      });

      const categoryList = categories.map((c: any) => c.category).filter(Boolean);

      res.json({
        success: true,
        data: categoryList,
      });
    } catch (error) {
      next(error);
    }
  }
}