// Retry utility functions
export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: number
  retryCondition?: (error: any) => boolean
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    retryCondition = () => true
  } = options

  let lastError: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === maxAttempts) {
        break
      }

      // Check if we should retry based on the error
      if (!retryCondition(error)) {
        break
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(backoff, attempt - 1)
      await sleep(waitTime)
    }
  }

  throw lastError
}

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    !error.response || // Network timeout
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ECONNABORTED' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('timeout')
  )
}

export const isRetryableError = (error: any): boolean => {
  // Retry network errors and 5xx server errors
  return (
    isNetworkError(error) ||
    (error.response?.status >= 500 && error.response?.status < 600) ||
    error.response?.status === 429 // Too Many Requests
  )
}

// API retry wrapper
export const withRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: RetryOptions
) => {
  return async (...args: T): Promise<R> => {
    return retry(
      () => fn(...args),
      {
        retryCondition: isRetryableError,
        ...options
      }
    )
  }
}