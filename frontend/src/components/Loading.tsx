import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  lines = 3
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  )
}

interface ProductCardSkeletonProps {
  className?: string
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  className = ''
}) => {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="aspect-[4/3] bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

interface CartItemSkeletonProps {
  className?: string
}

export const CartItemSkeleton: React.FC<CartItemSkeletonProps> = ({
  className = ''
}) => {
  return (
    <div className={`card animate-pulse flex items-center ${className}`}>
      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 mr-6" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="flex space-x-4 mt-4">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20" />
    </div>
  )
}