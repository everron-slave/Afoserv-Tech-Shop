import api from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    
    if (response.data.success && response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<RefreshTokenResponse>('/api/auth/refresh');
      
      if (response.data.success && response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        return response.data.data.accessToken;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      this.clearAuthData();
    }
    
    return null;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User | null> {
    try {
      const response = await api.get<ProfileResponse>('/api/auth/profile');
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error('Get profile error:', error);
    }
    
    return null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: { name?: string; phone?: string }): Promise<User | null> {
    try {
      const response = await api.put<ProfileResponse>('/api/auth/profile', data);
      
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
    
    return null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Clear all authentication data
   */
  static clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  /**
   * Initialize authentication - check if token exists and validate it
   */
  static async initialize(): Promise<boolean> {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }
    
    try {
      // Try to get user profile to validate token
      const user = await this.getProfile();
      return !!user;
    } catch (error) {
      this.clearAuthData();
      return false;
    }
  }
}