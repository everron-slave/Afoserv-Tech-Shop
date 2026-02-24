import { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const ProductsPage = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  // Mock products data - in real app this would come from API
  const products = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
      price: 2499,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      description: 'Titanium design, A17 Pro chip, 256GB',
      price: 999,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
      rating: 4.7,
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancellation',
      price: 399,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      rating: 4.6,
    },
    {
      id: '4',
      name: 'Dell XPS 15',
      description: 'Intel Core i9, 32GB RAM, 1TB SSD, OLED display',
      price: 2199,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
      rating: 4.5,
    },
    {
      id: '5',
      name: 'Samsung Galaxy S24',
      description: 'Dynamic AMOLED 2X, 256GB, AI features',
      price: 899,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
      rating: 4.4,
    },
    {
      id: '6',
      name: 'Logitech MX Master 3S',
      description: 'Wireless mouse with MagSpeed scrolling',
      price: 99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db',
      rating: 4.7,
    },
  ]

  const categories = ['all', 'Laptops', 'Smartphones', 'Accessories']

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesCategory =
      category === 'all' || product.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">
          Browse our collection of premium technology products
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No products found</div>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Results Count */}
      <div className="text-gray-600 text-sm">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  )
}

export default ProductsPage