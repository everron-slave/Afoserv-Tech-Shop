import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { memo } from 'react'
import { formatPrice } from '../utils/currency'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl?: string
    rating?: number
  }
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {/* Product Image - Reduced height */}
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-gray-100 rounded-lg mb-2 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
      </Link>

      {/* Product Info - More compact */}
      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-primary-600 font-medium uppercase tracking-wide">
              {product.category}
            </span>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-sm font-semibold text-gray-900 mt-0.5 hover:text-primary-600 transition-colors line-clamp-1 truncate">
                {product.name}
              </h3>
            </Link>
          </div>
          {product.rating && (
            <div className="flex items-center text-amber-600 ml-1 flex-shrink-0">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span className="ml-0.5 text-[10px] font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-[10px] line-clamp-1">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  )
})

export default ProductCard