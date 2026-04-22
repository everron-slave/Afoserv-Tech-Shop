import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, Heart, Check } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useProductStore } from '../store/productStore'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/currency'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const { getProduct, products } = useProductStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Find product by ID
  const product = getProduct(id || '') || products[0]
  
  // Get recommended products (excluding current product)
  const recommendedProducts = products
    .filter(p => p.id !== id)
    .slice(0, 4)

  // Fallback data for products from the store that might not have all fields
  const productWithFallbacks = product ? {
    ...product,
    rating: product.rating || 4.5,
    reviewCount: product.reviewCount || 100,
    images: product.images || [product.imageUrl],
    features: product.features || [
      'High-quality materials',
      'Reliable performance',
      'Excellent customer support',
      'Warranty included'
    ],
    inStock: product.inStock !== undefined ? product.inStock : true,
    warranty: product.warranty || '1-year limited warranty',
    shipping: product.shipping || 'Free 2-day shipping',
  } : null

  const handleAddToCart = () => {
    if (!productWithFallbacks) return
    
    addItem({
      productId: productWithFallbacks.id,
      name: productWithFallbacks.name,
      price: productWithFallbacks.price,
      quantity: quantity,
      imageUrl: productWithFallbacks.images[0],
    })
    toast.success(`Added ${quantity} ${productWithFallbacks.name} to cart!`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/checkout')
  }

  if (!productWithFallbacks) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link to="/products" className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img
              src={productWithFallbacks.images[selectedImage]}
              alt={productWithFallbacks.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productWithFallbacks.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary-600' : ''}`}
              >
                <img
                  src={img}
                  alt={`${productWithFallbacks.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full mb-2">
              {productWithFallbacks.category}
            </span>
            <h1 className="text-3xl font-bold mb-2">{productWithFallbacks.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(productWithFallbacks.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {productWithFallbacks.rating} ({productWithFallbacks.reviewCount} reviews)
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{productWithFallbacks.description}</p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-3xl font-bold">{formatPrice(productWithFallbacks.price)}</div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-1" />
                <span>{productWithFallbacks.warranty}</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Truck className="w-5 h-5 mr-1" />
                <span>{productWithFallbacks.shipping}</span>
              </div>
              <div className={`flex items-center ${productWithFallbacks.inStock ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${productWithFallbacks.inStock ? 'bg-green-600' : 'bg-red-600'}`} />
                <span>{productWithFallbacks.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="mr-4 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="btn-primary bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 flex-1 py-3 rounded-lg font-semibold"
              >
                <ShoppingCart className="w-5 h-5 mr-2 inline" />
                Add to Cart
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`${isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-800 border-gray-300'} border py-3 px-6 rounded-lg hover:bg-gray-50`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-600' : ''}`} />
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-primary bg-gray-800 text-white hover:bg-gray-900 flex-1 py-3 rounded-lg font-semibold"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Key Features</h3>
            <ul className="space-y-2">
              {productWithFallbacks.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Specifications</h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <table className="w-full">
                <tbody>
                  {productWithFallbacks.specifications.map((spec, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-3 font-medium text-gray-700">{spec.label}</td>
                      <td className="py-3 text-gray-900">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended For You Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Recommended For You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage