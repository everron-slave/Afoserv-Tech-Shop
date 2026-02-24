import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock user data
const mockUsers = [
  {
    id: '1',
    email: 'user@example.com',
    passwordHash: '$2a$12$K9q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q', // hashed "password123"
    name: 'Test User',
    role: 'USER',
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'admin@example.com',
    passwordHash: '$2a$12$K9q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q', // hashed "admin123"
    name: 'Admin User',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// JWT secrets (in production, these should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_min_32_chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here_min_32_chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export class MockAuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = mockUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      // In a real app, we would hash the password here
      // For mock purposes, we'll just create a user
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        email,
        passwordHash: `$2a$12$hashed_${password}`, // Mock hash
        name,
        role: 'USER' as const,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to mock users (in real app, save to database)
      mockUsers.push(newUser);

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign(
        { userId: newUser.id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN as any }
      );

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
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
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // In a real app, we would verify the password hash
      // For mock purposes, we'll accept any password
      const passwordValid = true; // Simplified for mock

      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN as any }
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
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
      }

      // Find user
      const user = mockUsers.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      res.json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app, user would be attached to req by auth middleware
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }
}