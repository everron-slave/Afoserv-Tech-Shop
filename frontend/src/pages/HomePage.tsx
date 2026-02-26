import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Mail, Phone, ShoppingBag, Star, Heart } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const HomePage = () => {
  // Product data for slideshow and sections - Optimized images with proper sizing
  const allProducts = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
      price: 2499,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      featured: true,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      description: 'Titanium design, A17 Pro chip, 256GB',
      price: 999,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop',
      featured: true,
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancellation',
      price: 399,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      featured: true,
    },
    {
      id: '4',
      name: 'Dell XPS 15',
      description: '4K OLED display, Intel i9, 32GB RAM',
      price: 2199,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '5',
      name: 'Samsung Galaxy S24',
      description: 'AI-powered camera, 512GB storage',
      price: 899,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w-800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '6',
      name: 'Apple Watch Series 9',
      description: 'Advanced health monitoring, GPS',
      price: 429,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '7',
      name: 'Microsoft Surface Laptop 5',
      description: 'Touchscreen, 13.5" PixelSense',
      price: 1299,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '8',
      name: 'Google Pixel 8 Pro',
      description: 'Tensor G3 chip, 120Hz display',
      price: 799,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '9',
      name: 'AirPods Pro 2',
      description: 'Active noise cancellation, spatial audio',
      price: 249,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
      featured: false,
    },
    // Additional products to reach 4 per category
    {
      id: '10',
      name: 'Lenovo ThinkPad X1 Carbon',
      description: 'Business laptop with Intel i7, 16GB RAM, 512GB SSD',
      price: 1699,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '11',
      name: 'OnePlus 12',
      description: 'Snapdragon 8 Gen 3, 256GB, 120Hz display',
      price: 699,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
      featured: false,
    },
    {
      id: '12',
      name: 'Samsung Galaxy Watch 6',
      description: 'Advanced health tracking, GPS, LTE option',
      price: 329,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3f4b9c5b5b1a?w=800&h=600&fit=crop',
      featured: false,
    },
  ]

  // Brands data - Optimized with smaller logos
  const brands = [
    { id: 1, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg?width=100' },
    { id: 2, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg?width=100' },
    { id: 3, name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg?width=100' },
    { id: 4, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg?width=100' },
    { id: 5, name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg?width=100' },
    { id: 6, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg?width=100' },
    { id: 7, name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/HP_New_Logo_2D.svg?width=100' },
    { id: 8, name: 'Lenovo', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Lenovo_logo_2015.svg?width=100' },
  ]

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0)
  const featuredProducts = allProducts.filter(p => p.featured)

  // Auto-rotate slideshow with optimized interval and reduced frequency
  useEffect(() => {
    let timeoutId: number;
    
    const rotateSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      timeoutId = window.setTimeout(rotateSlide, 8000); // Increased to 8 seconds for better performance
    };
    
    timeoutId = window.setTimeout(rotateSlide, 8000);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [featuredProducts.length]);

  // State for newsletter
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email || phone) {
      setSubscribed(true)
      setEmail('')
      setPhone('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  // Filter products by category
  const laptops = allProducts.filter(p => p.category === 'Laptops')
  const smartphones = allProducts.filter(p => p.category === 'Smartphones')
  const accessories = allProducts.filter(p => p.category === 'Accessories')
  const recommended = allProducts.slice(0, 4) // First 4 as recommended

  return (
    <div className="space-y-16">
      {/* Product Slideshow Section - Replaces "Your Trusted Technology Partner" */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-700">
        <div className="relative h-[400px] md:h-[350px] flex items-center">
          {/* Slideshow */}
          <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-full h-full flex items-center">
                <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center md:justify-between py-8 md:py-0">
                  <div className="w-full md:w-1/2 text-white mb-6 md:mb-0 order-2 md:order-1">
                    <h1 className="text-2xl md:text-4xl font-bold mb-3">{product.name}</h1>
                    <p className="text-base md:text-lg mb-4 text-primary-100 line-clamp-2 md:line-clamp-none">{product.description}</p>
                    <div className="flex items-center mb-4">
                      <span className="text-xl md:text-2xl font-bold">${product.price}</span>
                      <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs">Free Shipping</span>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="btn-primary bg-white text-primary-700 hover:bg-gray-100 inline-flex items-center px-4 py-2 md:px-5 md:py-2 rounded-lg font-semibold text-sm"
                    >
                      Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                  <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0 order-1 md:order-2">
                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                      <div className="absolute inset-0 bg-white/10 rounded-3xl transform rotate-6"></div>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="relative rounded-2xl shadow-2xl w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slideshow Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Sections */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Products</h2>
        
        {/* Laptops Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center">
              <ShoppingBag className="mr-2 text-primary-600" />
              Laptops & Computers
            </h3>
            <Link
              to="/products?category=laptops"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {laptops.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Smartphones Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center">
              <Phone className="mr-2 text-primary-600" />
              Smartphones & Tablets
            </h3>
            <Link
              to="/products?category=smartphones"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {smartphones.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Accessories Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center">
              <Star className="mr-2 text-primary-600" />
              Accessories & Gadgets
            </h3>
            <Link
              to="/products?category=accessories"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {accessories.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Products */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold flex items-center">
              <Heart className="mr-2 text-primary-600" />
              Recommended For You
            </h3>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {recommended.map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stay in Touch Section */}
      <section className="bg-gradient-to-r from-primary-50 to-primary-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in Touch</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips.
              Enter your email or phone number to stay updated.
            </p>
            
            {subscribed ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                Thank you for subscribing! We'll keep you updated with our latest offers.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 rounded-lg font-semibold"
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Brands Slideshow - Optimized with slower animation and will-change */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Featured Brands</h2>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-slow space-x-12 py-4 will-change-transform">
            {brands.concat(brands).map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex-shrink-0 w-40 h-24 bg-white rounded-xl shadow-sm flex items-center justify-center p-4 hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-10 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                  decoding="async"
                  width="100"
                  height="40"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage