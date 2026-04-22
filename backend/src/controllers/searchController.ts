import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class SearchController {
  /**
   * Advanced product search with full-text search, filtering, and sorting
   */
  static async advancedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;

      // Parse and validate query parameters
      const {
        q = '', // search query
        page = 1,
        limit = 20,
        category,
        minPrice,
        maxPrice,
        inStock,
        featured,
        sort = 'relevance', // default to relevance for search
        order = 'desc',
        specifications, // JSON string of specifications filter
      } = query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;
      const searchQuery = q as string;

      // Build filter
      const where: any = {
        active: true,
      };

      // Full-text search using PostgreSQL full-text search
      if (searchQuery.trim()) {
        // For PostgreSQL, we can use case-insensitive contains
        where.OR = [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { category: { contains: searchQuery } },
        ];
      }

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

      if (inStock === 'true') {
        where.stock = { gt: 0 };
      } else if (inStock === 'false') {
        where.stock = { equals: 0 };
      }

      if (featured === 'true') {
        where.featured = true;
      }

      // Parse specifications filter if provided
      if (specifications) {
        try {
          const specs = JSON.parse(specifications as string);
          // For now, we'll store specifications as JSON in description or a separate field
          // In a real implementation, you'd have a specifications field or table
          console.log('Specifications filter:', specs);
        } catch (error) {
          // Invalid JSON, ignore specifications filter
        }
      }

      // Build orderBy based on sort parameter
      const orderBy: any = {};
      const sortField = sort as string;
      const sortOrder = order as 'asc' | 'desc';

      // Validate sort field
      const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'relevance'];
      if (validSortFields.includes(sortField)) {
        if (sortField === 'relevance' && searchQuery.trim()) {
          // For relevance sorting with search query, we'll sort by a combination of factors
          // In a real implementation, you'd use PostgreSQL full-text search ranking
          orderBy.createdAt = sortOrder;
        } else if (sortField === 'relevance') {
          // No search query, default to createdAt
          orderBy.createdAt = sortOrder;
        } else {
          orderBy[sortField] = sortOrder;
        }
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

      // Calculate search metadata
      const searchMetadata = {
        query: searchQuery,
        filters: {
          category: category || 'all',
          priceRange: {
            min: minPrice ? parseFloat(minPrice as string) : null,
            max: maxPrice ? parseFloat(maxPrice as string) : null,
          },
          inStock: inStock || 'all',
          featured: featured || 'all',
        },
      };

      res.json({
        success: true,
        data: products,
        metadata: {
          search: searchMetadata,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
          sorting: {
            field: sortField,
            order: sortOrder,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get search suggestions/autocomplete
   */
  static async getSearchSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit = 10 } = req.query;
      const searchQuery = (q as string) || '';

      if (!searchQuery.trim()) {
        return res.json({
          success: true,
          data: [],
          metadata: {
            query: searchQuery,
            suggestions: [],
          },
        });
      }

      // Get product name suggestions
      const productSuggestions = await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: searchQuery } },
            { category: { contains: searchQuery } },
          ],
        },
        take: parseInt(limit as string) || 10,
        select: {
          id: true,
          name: true,
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Get category suggestions
      const categorySuggestions = await prisma.product.findMany({
        where: {
          active: true,
          category: { contains: searchQuery },
        },
        distinct: ['category'],
        take: 5,
        select: {
          category: true,
        },
      });

      // Format suggestions
      type SuggestionType = 'product' | 'category' | 'popular';
      interface Suggestion {
        type: SuggestionType;
        id: string | null;
        text: string;
        category: string;
      }

      const suggestions: Suggestion[] = [
        // Product name suggestions
        ...productSuggestions.map(product => ({
          type: 'product' as SuggestionType,
          id: product.id,
          text: product.name,
          category: product.category,
        })),
        // Category suggestions (deduplicated)
        ...Array.from(new Set(categorySuggestions.map(c => c.category)))
          .filter(category => !productSuggestions.some(p => p.category === category))
          .map(category => ({
            type: 'category' as SuggestionType,
            id: null,
            text: category,
            category: category,
          })),
      ].slice(0, parseInt(limit as string) || 10);

      // Add popular searches if we have few suggestions
      if (suggestions.length < 5) {
        const popularProducts = await prisma.product.findMany({
          where: { active: true, featured: true },
          take: 5 - suggestions.length,
          select: {
            id: true,
            name: true,
            category: true,
          },
        });

        suggestions.push(
          ...popularProducts.map(product => ({
            type: 'popular' as SuggestionType,
            id: product.id,
            text: product.name,
            category: product.category,
          }))
        );
      }

      return res.json({
        success: true,
        data: suggestions,
        metadata: {
          query: searchQuery,
          total: suggestions.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get search filters metadata (available categories, price ranges, etc.)
   */
  static async getSearchFilters(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all active categories
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

      // Get price range statistics
      const priceStats = await prisma.product.aggregate({
        where: { active: true },
        _min: { price: true },
        _max: { price: true },
        _avg: { price: true },
      });

      // Get stock status counts
      const inStockCount = await prisma.product.count({
        where: { active: true, stock: { gt: 0 } },
      });

      const outOfStockCount = await prisma.product.count({
        where: { active: true, stock: { equals: 0 } },
      });

      // Get featured products count
      const featuredCount = await prisma.product.count({
        where: { active: true, featured: true },
      });

      res.json({
        success: true,
        data: {
          categories: categories.map(c => c.category).filter(Boolean),
          priceRange: {
            min: priceStats._min.price || 0,
            max: priceStats._max.price || 0,
            avg: priceStats._avg.price || 0,
          },
          stock: {
            inStock: inStockCount,
            outOfStock: outOfStockCount,
          },
          featured: featuredCount,
          total: inStockCount + outOfStockCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular search terms (mock implementation - in production would use analytics)
   */
  static async getPopularSearches(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;

      // In a real implementation, you would query a search analytics table
      // For now, we'll return popular product names and categories
      const popularProducts = await prisma.product.findMany({
        where: { active: true, featured: true },
        take: parseInt(limit as string) || 10,
        select: {
          name: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const popularCategories = await prisma.product.findMany({
        where: { active: true },
        distinct: ['category'],
        take: 5,
        select: {
          category: true,
        },
      });

      const popularSearches = [
        ...popularProducts.map(p => ({
          term: p.name,
          type: 'product' as const,
          count: Math.floor(Math.random() * 100) + 50, // Mock count
        })),
        ...popularCategories.map(c => ({
          term: c.category,
          type: 'category' as const,
          count: Math.floor(Math.random() * 80) + 30, // Mock count
        })),
      ].slice(0, parseInt(limit as string) || 10);

      res.json({
        success: true,
        data: popularSearches,
        metadata: {
          total: popularSearches.length,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}