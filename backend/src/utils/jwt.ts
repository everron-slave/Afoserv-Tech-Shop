import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  private static readonly REMEMBER_ME_EXPIRES_IN = process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d';

  /**
   * Generate access token for a user
   */
  static generateAccessToken(payload: JwtPayload, rememberMe?: boolean): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const expiresIn = rememberMe ? this.REMEMBER_ME_EXPIRES_IN : this.ACCESS_TOKEN_EXPIRES_IN;

    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      this.JWT_SECRET,
      { expiresIn: expiresIn as any }
    );
  }

  /**
   * Generate refresh token for a user
   */
  static generateRefreshToken(payload: RefreshTokenPayload, rememberMe?: boolean): string {
    if (!this.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    const expiresIn = rememberMe ? this.REMEMBER_ME_EXPIRES_IN : this.REFRESH_TOKEN_EXPIRES_IN;

    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: expiresIn as any }
    );
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    if (!this.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    return jwt.verify(token, this.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      this.verifyAccessToken(token);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }

  /**
   * Generate both access and refresh tokens for a user
   */
  static generateTokens(user: { id: string; email: string; role: string }, rememberMe?: boolean): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload, rememberMe),
      refreshToken: this.generateRefreshToken(payload, rememberMe),
    };
  }
}