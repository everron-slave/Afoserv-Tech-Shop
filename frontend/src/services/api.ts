import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { withRetry } from '../utils/retry'

// Extend the InternalAxiosRequestConfig type to include _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Refresh token is automatically sent via HTTP-only cookie
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {}, // Empty body, refresh token is in cookies
          { withCredentials: true }
        )

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // For other errors, let the calling code handle retries if needed
    return Promise.reject(error)
  }
)

// Enhanced API methods with built-in retry logic
export const apiWithRetry = {
  get: withRetry(api.get, { maxAttempts: 3 }),
  post: withRetry(api.post, { maxAttempts: 2 }), // Less retries for mutations
  put: withRetry(api.put, { maxAttempts: 2 }),
  patch: withRetry(api.patch, { maxAttempts: 2 }),
  delete: withRetry(api.delete, { maxAttempts: 2 }),
}

// Error types for better error handling
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export const parseApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || error.response.data?.error || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      details: error
    }
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }
}

// Toast notification helper for API errors
export const showApiErrorToast = (error: any, toast: any) => {
  const parsedError = parseApiError(error)

  if (parsedError.code === 'NETWORK_ERROR') {
    toast.error('Connection failed. Please check your internet and try again.')
  } else if (parsedError.status === 429) {
    toast.error('Too many requests. Please wait a moment and try again.')
  } else if (parsedError.status === 403) {
    toast.error('You don\'t have permission to perform this action.')
  } else if (parsedError.status === 404) {
    toast.error('The requested resource was not found.')
  } else {
    toast.error(parsedError.message)
  }
}

export default api