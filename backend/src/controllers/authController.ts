import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtService } from '../utils/jwt';
import prisma from '../config/database';
import { getEmailService } from '../utils/email';

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

      // Generate tokens using JwtService
      const { accessToken, refreshToken } = JwtService.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Send welcome email (fire and forget - don't block response)
      try {
        const emailService = getEmailService();
        await emailService.sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }

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
      const { email, password, rememberMe } = req.body;

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

      // Generate tokens using JwtService (respect rememberMe for token expiry)
      const { accessToken, refreshToken } = JwtService.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      }, rememberMe);

      // Set refresh token as HTTP-only cookie (longer expiry if rememberMe)
      const cookieMaxAge = rememberMe
        ? 30 * 24 * 60 * 60 * 1000  // 30 days
        : 7 * 24 * 60 * 60 * 1000;  // 7 days

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: cookieMaxAge,
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
        sameSite: 'lax',
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

      // Verify refresh token using JwtService
      const decoded = JwtService.verifyRefreshToken(refreshToken);

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

      // Generate new access token AND rotate refresh token
      const accessToken = JwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Rotate refresh token for security (prevents stolen token reuse)
      const newRefreshToken = JwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Set new refresh token cookie (replaces old one)
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

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

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email) {
        const error = new Error('Email is required');
        (error as any).statusCode = 400;
        throw error;
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Don't reveal if user exists or not for security
      if (!user) {
        // Still return success to prevent email enumeration
        res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent',
        });
        return;
      }

      // Generate reset token (simple JWT token for now)
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          purpose: 'password_reset',
        },
        process.env.JWT_SECRET! + '_reset', // Different secret for reset tokens
        { expiresIn: '1h' }
      );

      // Send password reset email
      try {
        const emailService = getEmailService();
        await emailService.sendPasswordResetEmail(user.email, user.name || 'User', resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't fail the request if email fails
      }

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        const error = new Error('Token and new password are required');
        (error as any).statusCode = 400;
        throw error;
      }

      // Verify reset token
      let decoded: any;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET! + '_reset');
      } catch (jwtError) {
        const error = new Error('Invalid or expired reset token');
        (error as any).statusCode = 401;
        (error as any).code = 'INVALID_RESET_TOKEN';
        throw error;
      }

      // Check token purpose
      if (decoded.purpose !== 'password_reset') {
        const error = new Error('Invalid reset token');
        (error as any).statusCode = 401;
        (error as any).code = 'INVALID_RESET_TOKEN';
        throw error;
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = 404;
        (error as any).code = 'USER_NOT_FOUND';
        throw error;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'));
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}