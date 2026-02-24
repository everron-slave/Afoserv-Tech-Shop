import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: 'AFORSEV API is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

export { router };