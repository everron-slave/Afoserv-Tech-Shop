import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Star, Shield, Truck, MessageCircle, Heart, Check } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'

// Product database for all products
const productDatabase = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    description: 'Apple M3 Pro chip with 12‑core CPU, 18‑core GPU, 16‑core Neural Engine, 36GB unified memory, 1TB SSD storage',
    price: 2499,
    category: 'Laptops',
    rating: 4.8,
    reviewCount: 124,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=60',
    ],
    specifications: [
      { label: 'Processor', value: 'Apple M3 Pro (12-core)' },
      { label: 'Memory', value: '36GB Unified Memory' },
      { label: 'Storage', value: '1TB SSD' },
      { label: 'Display', value: '16.2-inch Liquid Retina XDR' },
      { label: 'Resolution', value: '3456 x 2234 pixels' },
      { label: 'Graphics', value: '18-core GPU' },
      { label: 'Battery', value: 'Up to 22 hours' },
      { label: 'Weight', value: '2.1 kg (4.7 pounds)' },
      { label: 'Ports', value: '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3' },
      { label: 'Wireless', value: 'Wi-Fi 6E, Bluetooth 5.3' },
    ],
    features: [
      'Liquid Retina XDR display with ProMotion',
      '1080p FaceTime HD camera',
      'Six-speaker sound system with force-cancelling woofers',
      'Magic Keyboard with Touch ID',
      'Studio-quality three-mic array',
      'Advanced thermal system for sustained performance',
    ],
    inStock: true,
    warranty: '1-year limited warranty',
    shipping: 'Free 2-day shipping',
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Titanium design, A17 Pro chip, 256GB storage, Pro camera system',
    price: 999,
    category: 'Smartphones',
    rating: 4.7,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Chip', value: 'A17 Pro chip' },
      { label: 'Storage', value: '256GB' },
      { label: 'Display', value: '6.1-inch Super Retina XDR' },
      { label: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
      { label: 'Battery', value: 'Up to 23 hours video playback' },
      { label: 'Material', value: 'Titanium design' },
      { label: 'Connectivity', value: '5G, Wi-Fi 6E' },
    ],
    features: [
      'Titanium design for lightweight durability',
      'A17 Pro chip for gaming and AI',
      '48MP Main camera for high-resolution photos',
      'Action button for quick shortcuts',
      'USB-C for charging and data transfer',
    ],
    inStock: true,
    warranty: '1-year limited warranty',
    shipping: 'Free 2-day shipping',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation with 30-hour battery life',
    price: 399,
    category: 'Accessories',
    rating: 4.9,
    reviewCount: 203,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Noise Cancellation', value: 'Industry-leading' },
      { label: 'Battery Life', value: 'Up to 30 hours' },
      { label: 'Quick Charge', value: '3 minutes = 3 hours playback' },
      { label: 'Weight', value: '250g' },
      { label: 'Connectivity', value: 'Bluetooth 5.2, NFC' },
      { label: 'Microphones', value: '8 microphones for calls' },
    ],
    features: [
      'Industry-leading noise cancellation',
      '30-hour battery life with quick charging',
      'Crystal clear hands-free calling',
      'Wearing detection automatically pauses playback',
      'Adaptive Sound Control adjusts to your environment',
    ],
    inStock: true,
    warranty: '2-year limited warranty',
    shipping: 'Free 2-day shipping',
  },
  {
    id: '4',
    name: 'Dell XPS 15',
    description: '4K OLED display, Intel i9, 32GB RAM, 1TB SSD',
    price: 2199,
    category: 'Laptops',
    rating: 4.6,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Processor', value: 'Intel Core i9-13900H' },
      { label: 'Memory', value: '32GB DDR5' },
      { label: 'Storage', value: '1TB NVMe SSD' },
      { label: 'Display', value: '15.6" 4K OLED Touch' },
      { label: 'Graphics', value: 'NVIDIA GeForce RTX 4060' },
      { label: 'Battery', value: '86Whr, up to 10 hours' },
    ],
    features: [
      '4K OLED touch display with HDR',
      'Intel Core i9 processor for maximum performance',
      'NVIDIA RTX 4060 graphics for gaming and creative work',
      'Premium aluminum and carbon fiber construction',
      'InfinityEdge display with minimal bezels',
    ],
    inStock: true,
    warranty: '1-year premium support',
    shipping: 'Free 2-day shipping',
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24',
    description: 'AI-powered camera, 512GB storage, 120Hz Dynamic AMOLED',
    price: 899,
    category: 'Smartphones',
    rating: 4.5,
    reviewCount: 92,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { label: 'Storage', value: '512GB' },
      { label: 'Display', value: '6.2" Dynamic AMOLED 2X' },
      { label: 'Refresh Rate', value: '120Hz' },
      { label: 'Camera', value: '50MP + 12MP + 10MP' },
      { label: 'Battery', value: '4000mAh' },
    ],
    features: [
      'AI-powered camera with Nightography',
      '7 years of OS updates guaranteed',
      'Circle to Search with Google',
      'Live Translate for real-time conversations',
      'Super Fast Charging 2.0',
    ],
    inStock: true,
    warranty: '1-year manufacturer warranty',
    shipping: 'Free 2-day shipping',
  },
  {
    id: '6',
    name: 'Apple Watch Series 9',
    description: 'Advanced health monitoring, GPS, Always-On Retina display',
    price: 429,
    category: 'Accessories',
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6',
      'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6?auto=format&fit=crop&w=800&q=80',
    ],
    specifications: [
      { label: 'Display', value: 'Always-On Retina LTPO OLED' },
      { label: 'Processor', value: 'S9 SiP' },
      { label: 'Battery Life', value: 'Up to 18 hours' },
      { label: 'Water Resistance', value: '50 meters' },
      { label: 'Health Sensors', value: 'Blood Oxygen, ECG, Heart Rate' },
      { label: 'Connectivity', value: 'GPS, Cellular optional' },
    ],
    features: [
      'Double tap gesture for hands-free control',
      'Advanced health monitoring with ECG',
      'Crash Detection and Fall Detection',
      'Temperature sensing for cycle tracking',
      'Bright 2000-nit Always-On display',
    ],
    inStock: true,
    warranty: '1-year limited warranty',
    shipping: 'Free 2-day shipping',
  },
]

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Find product by ID
  const product = productDatabase.find(p => p.id === id) || productDatabase[0]
  
  // Get recommended products (excluding current product)
  const recommendedProducts = productDatabase
    .filter(p => p.id !== id)
    .slice(0, 4)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.images[0],
    })
    toast.success(`Added ${quantity} ${product.name} to cart!`)
  }

  const handleWhatsAppContact = () => {
    const message = `Hello! I'm interested in the ${product.name} (Product ID: ${product.id}). Can you provide more details?`
    const phoneNumber = '+1234567890' // Replace with actual support number
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // In a real app, this would redirect to checkout
    toast.success('Product added! Proceed to checkout from your cart.')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>
          <div className="flex space-x-4">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary-500' : 'border-gray-200'}`}
              >
                <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
              <span className="mx-4 text-gray-300">|</span>
              <span className={`px-3 py-1 rounded-full text-sm ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="text-4xl font-bold">${product.price}</span>
              <span className="ml-4 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                {product.warranty}
              </div>
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                {product.shipping}
              </div>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <span className="mr-4 font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="ml-6 p-2 border rounded-lg hover:bg-gray-50"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="btn-primary bg-primary-600 text-white hover:bg-primary-700 flex-1 py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-primary bg-gray-800 text-white hover:bg-gray-900 flex-1 py-3 rounded-lg font-semibold"
              >
                Buy Now
              </button>
            </div>

            {/* WhatsApp Contact Button with WhatsApp Logo */}
            <button
              onClick={handleWhatsAppContact}
              className="mt-4 w-full bg-green-600 text-white hover:bg-green-700 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              <span className="flex items-center">
                <span className="font-bold">WhatsApp</span>
                <span className="ml-1">Chat with Our Team</span>
              </span>
            </button>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
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
                  {product.specifications.map((spec, index) => (
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