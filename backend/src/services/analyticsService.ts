import prisma from '../config/database';

export interface AnalyticsMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  ordersByDay: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    returningCustomers: number;
  };
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics for the dashboard
   */
  static async getDashboardMetrics(startDate?: Date, endDate?: Date): Promise<AnalyticsMetrics> {
    const whereClause: any = {};
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    // Get total orders and revenue
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    orders.forEach(order => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    // Top products
    const productSales: Record<string, { 
      productId: string; 
      name: string; 
      quantitySold: number; 
      revenue: number;
    }> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.product?.name || 'Unknown Product',
            quantitySold: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantitySold += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.unitPrice;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Orders by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    const ordersByDayMap: Record<string, { count: number; revenue: number }> = {};
    recentOrders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!ordersByDayMap[dateStr]) {
        ordersByDayMap[dateStr] = { count: 0, revenue: 0 };
      }
      ordersByDayMap[dateStr].count += 1;
      ordersByDayMap[dateStr].revenue += order.totalAmount;
    });

    const ordersByDay = Object.entries(ordersByDayMap)
      .map(([date, data]) => ({
        date,
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Customer metrics
    const totalCustomers = await prisma.user.count();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: thisMonth
        }
      }
    });

    // Returning customers (users with more than 1 order)
    const usersWithOrders = await prisma.user.findMany({
      include: {
        orders: true
      }
    });

    const returningCustomers = usersWithOrders.filter(user => user.orders.length > 1).length;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      topProducts,
      ordersByDay,
      customerMetrics: {
        totalCustomers,
        newCustomersThisMonth,
        returningCustomers
      }
    };
  }

  /**
   * Track an event (e.g., page view, product view, add to cart)
   * Note: This would require an AnalyticsEvent model in the Prisma schema
   * For now, we'll log to console and could integrate with external services
   */
  static async trackEvent(
    eventType: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // In a production system, you would:
      // 1. Store in a dedicated analytics database/table
      // 2. Send to Google Analytics/Mixpanel/Amplitude
      // 3. Log to a monitoring service
      
      console.log(`[Analytics] Event: ${eventType}, User: ${userId || 'anonymous'}, Metadata:`, metadata);
      
      // For now, we could store in a simple log or skip database storage
      // since we don't have an AnalyticsEvent model
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      // Don't throw - analytics shouldn't break the application
    }
  }

  /**
   * Get conversion rate metrics
   */
  static async getConversionMetrics(): Promise<{
    cartToOrderRate: number;
    checkoutToOrderRate: number;
    totalSessions: number;
  }> {
    // In a real implementation, you would query session data
    // For now, we'll calculate based on orders vs estimated sessions
    
    const totalOrders = await prisma.order.count();
    
    // Estimate sessions (this would come from actual session tracking)
    // For demo purposes, we'll use a fixed multiplier
    const estimatedSessions = Math.max(totalOrders * 10, 100);
    
    const cartToOrderRate = totalOrders > 0 ? (totalOrders / estimatedSessions) * 100 : 0;
    
    return {
      cartToOrderRate: parseFloat(cartToOrderRate.toFixed(2)),
      checkoutToOrderRate: parseFloat((cartToOrderRate * 1.5).toFixed(2)), // Estimated
      totalSessions: estimatedSessions
    };
  }

  /**
   * Get revenue by product category
   */
  static async getRevenueByCategory(): Promise<Array<{
    category: string;
    revenue: number;
    orderCount: number;
  }>> {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const categoryRevenue: Record<string, { revenue: number; orderCount: number }> = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || 'Uncategorized';
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = { revenue: 0, orderCount: 0 };
        }
        categoryRevenue[category].revenue += item.quantity * item.unitPrice;
      });
      
      // Count unique categories per order
      const uniqueCategories = new Set(
        order.items.map(item => item.product?.category || 'Uncategorized')
      );
      uniqueCategories.forEach(category => {
        categoryRevenue[category].orderCount += 1;
      });
    });

    return Object.entries(categoryRevenue)
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        orderCount: data.orderCount
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(threshold: number = 10): Promise<Array<{
    productId: string;
    name: string;
    currentStock: number;
    threshold: number;
  }>> {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold
        },
        active: true
      },
      select: {
        id: true,
        name: true,
        stock: true
      },
      orderBy: {
        stock: 'asc'
      }
    });

    return lowStockProducts.map(product => ({
      productId: product.id,
      name: product.name,
      currentStock: product.stock,
      threshold
    }));
  }
}