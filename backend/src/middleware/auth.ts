import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtService, JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Development bypass - ONLY enabled with explicit environment variable
  // This is for testing purposes only and should NEVER be enabled in production
  if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
    // Check for explicit development bypass header
    const devBypass = req.headers['x-dev-bypass'] === 'true';
    
    if (devBypass) {
      // Attach a mock admin user for development testing ONLY
      req.user = {
        userId: 'dev-user-id',
        email: 'dev@example.com',
        role: 'USER' // Default to USER role, not ADMIN
      };
      req.token = 'dev-bypass-token';
      console.warn('⚠️ SECURITY WARNING: Development authentication bypass enabled for:', req.path);
      console.warn('⚠️ This should NEVER be enabled in production environment');
      return next();
    }
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token using JwtService
    const decoded = JwtService.verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const err = new Error('Token expired');
      (err as any).statusCode = 401;
      (err as any).code = 'TOKEN_EXPIRED';
      return next(err);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      const err = new Error('Invalid token');
      (err as any).statusCode = 401;
      (err as any).code = 'INVALID_TOKEN';
      return next(err);
    }

    const err = new Error('Authentication failed');
    (err as any).statusCode = 401;
    (err as any).code = 'AUTH_FAILED';
    next(err);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const error = new Error('Authentication required');
      (error as any).statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('Insufficient permissions');
      (error as any).statusCode = 403;
      (error as any).code = 'FORBIDDEN';
      return next(error);
    }

    next();
  };
};