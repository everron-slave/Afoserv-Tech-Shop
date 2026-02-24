import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, phone } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const error = new Error('User already exists');
        (error as any).statusCode = 409;
        (error as any).code = 'USER_EXISTS';
        throw error;
      }

      // Hash password
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'));
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any }
      );

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        const error = new Error('Invalid credentials');
        (error as any).statusCode = 401;
        (error as any).code = 'INVALID_CREDENTIALS';
        throw error;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        const error = new Error('Invalid credentials');
        (error as any).statusCode = 401;
        (error as any).code = 'INVALID_CREDENTIALS';
        throw error;
      }

      // Generate tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any }
      );

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        const error = new Error('Refresh token required');
        (error as any).statusCode = 401;
        (error as any).code = 'REFRESH_TOKEN_REQUIRED';
        throw error;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
        email: string;
        role: string;
      };

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = 404;
        (error as any).code = 'USER_NOT_FOUND';
        throw error;
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const err = new Error('Refresh token expired');
        (err as any).statusCode = 401;
        (err as any).code = 'REFRESH_TOKEN_EXPIRED';
        return next(err);
      }

      if (error instanceof jwt.JsonWebTokenError) {
        const err = new Error('Invalid refresh token');
        (err as any).statusCode = 401;
        (err as any).code = 'INVALID_REFRESH_TOKEN';
        return next(err);
      }

      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = 404;
        (error as any).code = 'USER_NOT_FOUND';
        throw error;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { name, phone } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}