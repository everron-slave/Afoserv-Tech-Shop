import { ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

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

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-primary-600 font-medium">
              {product.category}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">
              {product.name}
            </h3>
          </div>
          {product.rating && (
            <div className="flex items-center text-amber-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-sm font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn-primary flex items-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard