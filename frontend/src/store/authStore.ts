import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService, User } from '../services/authService'

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  getProfile: () => Promise<void>
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Login action
      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await AuthService.login({ email, password, rememberMe })
          
          if (result.success) {
            set({ 
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            set({ 
              error: result.message || 'Login failed',
              isLoading: false 
            })
            throw new Error(result.message || 'Login failed')
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed'
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      },
      
      // Register action
      register: async (email: string, password: string, name: string, phone?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const result = await AuthService.register({ email, password, name, phone })
          
          if (result.success) {
            set({ 
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            set({ 
              error: result.message || 'Registration failed',
              isLoading: false 
            })
            throw new Error(result.message || 'Registration failed')
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      },
      
      // Logout action
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await AuthService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },
      
      // Refresh token action
      refreshToken: async () => {
        try {
          const token = await AuthService.refreshToken()
          if (token) {
            // Token refreshed successfully, try to get profile
            await get().getProfile()
            return true
          }
          return false
        } catch (error) {
          console.error('Refresh token error:', error)
          return false
        }
      },
      
      // Get profile action
      getProfile: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await AuthService.getProfile()
          
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            set({ 
              isAuthenticated: false,
              isLoading: false 
            })
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to get profile'
          set({ 
            error: errorMessage,
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },
      
      // Update profile action
      updateProfile: async (data: { name?: string; phone?: string }) => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await AuthService.updateProfile(data)
          
          if (user) {
            set({ 
              user,
              isLoading: false 
            })
          } else {
            set({ 
              error: 'Failed to update profile',
              isLoading: false 
            })
            throw new Error('Failed to update profile')
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile'
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      },
      
      // Clear error action
      clearError: () => {
        set({ error: null })
      },
      
      // Initialize auth state
      initialize: async () => {
        const token = AuthService.getAccessToken()
        
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }
        
        // Try to get profile to validate token
        try {
          await get().getProfile()
        } catch (error) {
          // Token might be expired — attempt refresh before giving up
          console.error('Profile fetch failed, attempting token refresh:', error)
          try {
            const refreshed = await get().refreshToken()
            if (!refreshed) {
              set({ isAuthenticated: false, user: null })
            }
          } catch (refreshError) {
            console.error('Token refresh also failed during initialization:', refreshError)
            set({ isAuthenticated: false, user: null })
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

// Helper hooks
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user)
  return user?.role === 'ADMIN'
}
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)