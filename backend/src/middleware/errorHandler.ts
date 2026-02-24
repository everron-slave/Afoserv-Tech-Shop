import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError } from 'jsonwebtoken';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    errorCode = 'CONFLICT';
  } else if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'NOT_FOUND';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(err instanceof ZodError && { details: err.issues })
    },
    timestamp: new Date().toISOString()
  });
};