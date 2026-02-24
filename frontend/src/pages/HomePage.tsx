import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Shield, Truck } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const HomePage = () => {
  const featuredProducts = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
      price: 2499,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      description: 'Titanium design, A17 Pro chip, 256GB',
      price: 999,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancellation',
      price: 399,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    },
  ]

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Wide Selection',
      description: 'Thousands of tech products from top brands',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Shopping',
      description: 'SSL encryption and secure payment processing',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $50',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Trusted Technology Partner
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Discover the latest gadgets, electronics, and tech accessories at
            unbeatable prices.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="btn-primary bg-white text-primary-700 hover:bg-gray-100 inline-flex items-center"
            >
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/products?category=laptops"
              className="btn-secondary bg-transparent border-white text-white hover:bg-white/10"
            >
              Browse Laptops
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">
          Why Shop With Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link
            to="/products"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of satisfied customers who trust AFORSEV for their
            technology needs.
          </p>
          <Link
            to="/register"
            className="btn-primary bg-white text-gray-900 hover:bg-gray-100 inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage