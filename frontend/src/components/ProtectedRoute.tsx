import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks authentication and optionally admin role
 * before allowing access to protected routes.
 */
export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    if (!isAuthenticated && !isLoading) {
      initialize();
    }
  }, [isAuthenticated, isLoading, initialize]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, saving the current location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if admin role is required but user is not admin
  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

/**
 * AdminRoute component specifically for admin-only routes
 */
export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAdmin redirectTo="/">
      {children}
    </ProtectedRoute>
  );
};

/**
 * AuthRoute component for routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 */
export const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};