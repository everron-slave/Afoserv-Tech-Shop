import { useState, useCallback } from 'react'
import { retry, RetryOptions } from '../utils/retry'
import { showApiErrorToast } from '../services/api'
import toast from 'react-hot-toast'

interface UseRetryOptions extends RetryOptions {
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  showToastOnError?: boolean
}

export const useRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: UseRetryOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [retryCount, setRetryCount] = useState(0)

  const {
    onSuccess,
    onError,
    showToastOnError = true,
    ...retryOptions
  } = options

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setIsLoading(true)
    setError(null)
    setRetryCount(0)

    try {
      const result = await retry(
        async () => {
          setRetryCount(prev => prev + 1)
          return await fn(...args)
        },
        retryOptions
      )

      setIsLoading(false)
      onSuccess?.(result)
      return result
    } catch (err) {
      setIsLoading(false)
      setError(err)
      onError?.(err)
      
      if (showToastOnError) {
        showApiErrorToast(err, toast)
      }
      
      return null
    }
  }, [fn, retryOptions, onSuccess, onError, showToastOnError])

  const reset = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    execute,
    isLoading,
    error,
    retryCount,
    reset
  }
}