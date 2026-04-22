import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Filter, Search } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { EmptySearch } from '../components/EmptyState'
import { ProductCardSkeleton } from '../components/Loading'
import { useProductStore } from '../store/productStore'

const ProductsPage = () => {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Use productStore as centralized product source
  const { products, isLoading: productsLoading, error, fetchProducts } = useProductStore()
  
  // Map URL kebab-case category params to actual database category values
  const categoryUrlMap: Record<string, string> = {
    'projectors': 'PROJECTORS',
    'screens': 'SCREENS',
    'displays': 'DISPLAYS',
    'monitors': 'MONITORS',
    'led-walls': 'LED WALLS',
    'led walls': 'LED WALLS',
    'video-conferencing': 'VIDEO CONFERENCING',
    'video conferencing': 'VIDEO CONFERENCING',
    'audio': 'AUDIO',
    'ubiquiti': 'UBIQUITI',
    'hdd': 'HDD',
    'apple': 'APPLE',
    'hpe aura switches': 'HPE AURA SWITCHES',
    // Mega menu category mappings
    'conference-equipment': 'VIDEO CONFERENCING',
    'radio-communication': 'AUDIO',
    'telephone-equipment': 'AUDIO',
    'smart-components': 'UBIQUITI',
    'mobile-navigation': 'UBIQUITI',
    'digitization-equipment': 'DISPLAYS',
    'networks': 'UBIQUITI',
    'components': 'UBIQUITI',
    'computers': 'APPLE',
    'software': 'APPLE',
    'printers-scanners': 'DISPLAYS',
    'data-storage': 'HDD',
    'surveillance-systems': 'VIDEO CONFERENCING',
    'access-controls': 'AUDIO',
    'sensors-alarms': 'AUDIO',
    'security-products': 'AUDIO',
    'fire-protection': 'AUDIO',
    'wiring': 'UBIQUITI',
    'electrical-protections': 'HPE AURA SWITCHES',
    'generators': 'HPE AURA SWITCHES',
    'electrical-enclosures': 'HPE AURA SWITCHES',
    'solar-panels': 'PROJECTORS',
    'inverters': 'PROJECTORS',
    'batteries': 'HDD',
    'storage-systems': 'HDD',
    'presentation-supplies': 'PROJECTORS',
    'headphones': 'AUDIO',
    'tvs': 'DISPLAYS',
    // Category tab items mappings
    'configurators': 'UBIQUITI',
    'network-equipments': 'UBIQUITI',
    'server-solutions': 'HPE AURA SWITCHES',
    'food': 'APPLE',
    'pc-deal': 'APPLE',
    'heat-pump-solar': 'PROJECTORS',
    'ai': 'UBIQUITI',
    'others': 'all',
  }

  // Get category and search from URL query parameters
  const getCategoryFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    // Check if categoryParam matches any of our actual product categories
    if (categoryParam) {
      const lowerParam = categoryParam.toLowerCase()
      // First try the explicit URL mapping
      if (categoryUrlMap[lowerParam]) {
        return categoryUrlMap[lowerParam]
      }
      // Fallback: try uppercase match against actual product categories
      const upperParam = categoryParam.toUpperCase()
      const uniqueCategories = Array.from(new Set(products.map(p => p.category)))
      if (uniqueCategories.includes(upperParam)) {
        return upperParam
      }
    }
    return 'all'
  }, [location.search, products])
  
  // Get search query from URL
  const getSearchFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    return params.get('search') || ''
  }, [location.search])
  
  const [category, setCategory] = useState(getCategoryFromUrl())

  // Get unique categories from products for filter buttons
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)))
    return ['all', ...uniqueCategories]
  }, [products])

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update category and search when URL changes
  useEffect(() => {
    const newCategory = getCategoryFromUrl()
    const newSearch = getSearchFromUrl()
    setCategory(newCategory)
    setSearch(newSearch)
  }, [getCategoryFromUrl, getSearchFromUrl])

  // Debounce search input to prevent excessive filtering
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setIsLoading(false)
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

  // Combined loading state
  const combinedLoading = productsLoading || isLoading

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
      {error ? (
        <div className="card bg-red-50 border-red-200">
          <div className="text-red-700">
            <h3 className="font-bold">Error loading products</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => fetchProducts()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : combinedLoading ? (
        <div className="grid grid-mobile-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-mobile-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptySearch query={debouncedSearch} />
      )}

      {/* Results Count */}
      {!combinedLoading && !error && (
        <div className="text-gray-600 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  )
}

export default ProductsPage