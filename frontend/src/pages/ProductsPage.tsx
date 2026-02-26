import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'

const ProductsPage = () => {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Get category and search from URL query parameters
  const getCategoryFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    return categoryParam && ['laptops', 'smartphones', 'accessories'].includes(categoryParam.toLowerCase())
      ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
      : 'all'
  }, [location.search])
  
  // Get search query from URL
  const getSearchFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    return params.get('search') || ''
  }, [location.search])
  
  const [category, setCategory] = useState(getCategoryFromUrl())

  // Mock products data - in real app this would come from API
  const products = [
    {
      id: '1',
      name: 'MacBook Pro 16"',
      description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
      price: 2499,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro',
      description: 'Titanium design, A17 Pro chip, 256GB',
      price: 999,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600&fit=crop',
      rating: 4.7,
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancellation',
      price: 399,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      rating: 4.6,
    },
    {
      id: '4',
      name: 'Dell XPS 15',
      description: 'Intel Core i9, 32GB RAM, 1TB SSD, OLED display',
      price: 2199,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=600&fit=crop',
      rating: 4.5,
    },
    {
      id: '5',
      name: 'Samsung Galaxy S24',
      description: 'Dynamic AMOLED 2X, 256GB, AI features',
      price: 899,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop',
      rating: 4.4,
    },
    {
      id: '6',
      name: 'Logitech MX Master 3S',
      description: 'Wireless mouse with MagSpeed scrolling',
      price: 99,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=600&fit=crop',
      rating: 4.7,
    },
    // Additional products - one per category
    {
      id: '7',
      name: 'HP Spectre x360',
      description: 'Convertible laptop with 4K touchscreen, Intel i7',
      price: 1499,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      rating: 4.3,
    },
    {
      id: '8',
      name: 'Google Pixel 8 Pro',
      description: 'Tensor G3 chip, 120Hz display, 512GB',
      price: 799,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=600&fit=crop',
      rating: 4.5,
    },
    {
      id: '9',
      name: 'Apple AirPods Pro 2',
      description: 'Active noise cancellation, spatial audio',
      price: 249,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=600&fit=crop',
      rating: 4.6,
    },
    // Additional products to match HomePage
    {
      id: '10',
      name: 'Lenovo ThinkPad X1 Carbon',
      description: 'Business laptop with Intel i7, 16GB RAM, 512GB SSD',
      price: 1699,
      category: 'Laptops',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=600&fit=crop',
      rating: 4.4,
    },
    {
      id: '11',
      name: 'OnePlus 12',
      description: 'Snapdragon 8 Gen 3, 256GB, 120Hz display',
      price: 699,
      category: 'Smartphones',
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop',
      rating: 4.5,
    },
    {
      id: '12',
      name: 'Samsung Galaxy Watch 6',
      description: 'Advanced health tracking, GPS, LTE option',
      price: 329,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3f4b9c5b5b1a?w=800&h=600&fit=crop',
      rating: 4.3,
    },
  ]

  const categories = ['all', 'Laptops', 'Smartphones', 'Accessories']

  // Update category and search when URL changes
  useEffect(() => {
    const newCategory = getCategoryFromUrl()
    const newSearch = getSearchFromUrl()
    setCategory(newCategory)
    setSearch(newSearch)
  }, [getCategoryFromUrl, getSearchFromUrl])

  // Debounce search input to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300) // 300ms delay

    return () => {
      clearTimeout(timer)
    }
  }, [search])

  // Memoized filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
      const matchesCategory =
        category === 'all' || product.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, debouncedSearch, category])

  // Memoized category button handler
  const handleCategoryChange = useCallback((cat: string) => {
    setCategory(cat)
  }, [])

  // Memoized search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

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
                onChange={handleSearchChange}
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
                  onClick={() => handleCategoryChange(cat)}
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