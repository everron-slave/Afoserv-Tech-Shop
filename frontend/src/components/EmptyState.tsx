import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Search, Heart, Package, AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    href: string
    variant?: 'primary' | 'secondary'
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        {icon || <Package className="w-8 h-8 text-gray-400" />}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      <div className="space-y-3">
        {action && (
          <Link
            to={action.href}
            className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
              action.variant === 'secondary'
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {action.label}
          </Link>
        )}
        {secondaryAction && (
          <div>
            <Link
              to={secondaryAction.href}
              className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                secondaryAction.variant === 'primary'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {secondaryAction.label}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-configured empty states for common scenarios
export const EmptyCart: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
    title="Your cart is empty"
    description="Add some amazing products to your cart and start shopping!"
    action={{
      label: "Browse Products",
      href: "/products"
    }}
    className={className}
  />
)

export const EmptySearch: React.FC<{ query?: string; className?: string }> = ({
  query,
  className
}) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-gray-400" />}
    title="No products found"
    description={
      query
        ? `We couldn't find any products matching "${query}". Try adjusting your search or browse our categories.`
        : "No products match your current filters. Try adjusting your search criteria."
    }
    action={{
      label: "Browse All Products",
      href: "/products"
    }}
    secondaryAction={{
      label: "Clear Filters",
      href: "/products",
      variant: "secondary"
    }}
    className={className}
  />
)

export const EmptyWishlist: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    icon={<Heart className="w-8 h-8 text-gray-400" />}
    title="Your wishlist is empty"
    description="Save items you're interested in to keep track of them for later."
    action={{
      label: "Browse Products",
      href: "/products"
    }}
    className={className}
  />
)

export const EmptyOrders: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    icon={<Package className="w-8 h-8 text-gray-400" />}
    title="No orders yet"
    description="You haven't placed any orders yet. Start shopping to see your order history here."
    action={{
      label: "Start Shopping",
      href: "/products"
    }}
    className={className}
  />
)

export const ErrorState: React.FC<{
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}> = ({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  className
}) => (
  <EmptyState
    icon={<AlertCircle className="w-8 h-8 text-red-400" />}
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      href: "#",
      variant: "primary"
    } : undefined}
    className={className}
  />
)