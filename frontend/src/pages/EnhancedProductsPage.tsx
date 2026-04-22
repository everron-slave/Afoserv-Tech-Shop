import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import AdvancedSearch from '../components/AdvancedSearch'
import SearchPagination from '../components/SearchPagination'
import { searchService, SearchFilters } from '../services/searchService'
import { productService, Product } from '../services/productService'
import { Loader2, Filter, X } from 'lucide-react'

const EnhancedProductsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false)

  // Parse filters from URL
  const parseFiltersFromUrl = useCallback((): SearchFilters => {
    const searchParams = new URLSearchParams(location.search)
    return searchService.parseFiltersFromUrl(searchParams)
  }, [location.search])

  const [filters, setFilters] = useState<SearchFilters>(parseFiltersFromUrl())

  // Update filters when URL changes
  useEffect(() => {
    const newFilters = parseFiltersFromUrl()
    setFilters(newFilters)
    
    // Determine if we should use advanced search
    const hasSearchParams = location.search.includes('q=') || 
      location.search.includes('category=') ||
      location.search.includes('minPrice=') ||
      location.search.includes('maxPrice=') ||
      location.search.includes('inStock=') ||
      location.search.includes('featured=')
    
    setUseAdvancedSearch(hasSearchParams)
  }, [location.search, parseFiltersFromUrl])

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (useAdvancedSearch && (filters.q || Object.keys(filters).length > 1)) {
        // Use advanced search
        const result = await searchService.advancedSearch(filters)
        setSearchResults(result)
        setProducts(result.data)
      } else {
        // Use basic product listing
        const result = await productService.getProducts({
          category: filters.category,
          search: filters.q,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          featured: filters.featured === true,
          page: filters.page,
          limit: filters.limit,
        })
        setSearchResults(result)
        setProducts(result.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err)
      setError(err.message || 'Failed to load products')
      setProducts([])
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [filters, useAdvancedSearch])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (searchFilters: SearchFilters) => {
    const queryString = searchService.buildUrlFromFilters(searchFilters)
    navigate(`/products?${queryString}`)
  }

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page }
    handleSearch(updatedFilters)
  }

  const toggleSearchMode = () => {
    setUseAdvancedSearch(!useAdvancedSearch)
    if (!useAdvancedSearch) {
      // Switch to advanced search - keep current filters
      navigate(`/products?${searchService.buildUrlFromFilters(filters)}`)
    } else {
      // Switch to basic search - clear advanced filters
      navigate(`/products?q=${filters.q || ''}`)
    }
  }

  const clearAllFilters = () => {
    navigate('/products')
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.minPrice !== undefined) count++
    if (filters.maxPrice !== undefined) count++
    if (filters.inStock !== undefined && filters.inStock !== 'all') count++
    if (filters.featured !== undefined && filters.featured !== 'all') count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            Browse our collection of premium technology products
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSearchMode}
            className="btn btn-outline flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {useAdvancedSearch ? 'Basic Search' : 'Advanced Search'}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn btn-outline text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="card">
        <AdvancedSearch
          onSearch={handleSearch}
          initialFilters={filters}
          showFilters={useAdvancedSearch}
        />
      </div>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading products...
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : searchResults ? (
            <div className="text-gray-700">
              <span className="font-medium">{searchResults.metadata?.pagination?.total || products.length}</span> products found
              {filters.q && (
                <span> for "<span className="font-medium">{filters.q}</span>"</span>
              )}
            </div>
          ) : null}
        </div>
        
        {searchResults?.metadata?.sorting && (
          <div className="text-sm text-gray-600">
            Sorted by: <span className="font-medium capitalize">{searchResults.metadata.sorting.field}</span> ({searchResults.metadata.sorting.order})
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading && products.length === 0 ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto" />
          <p className="text-gray-600 mt-4">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchProducts}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {searchResults?.metadata?.pagination && searchResults.metadata.pagination.totalPages > 1 && (
            <div className="mt-8">
              <SearchPagination
                currentPage={searchResults.metadata.pagination.page}
                totalPages={searchResults.metadata.pagination.totalPages}
                totalItems={searchResults.metadata.pagination.total}
                itemsPerPage={searchResults.metadata.pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No products found</div>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={clearAllFilters}
            className="btn btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Search Tips */}
      {!useAdvancedSearch && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Filter className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Try Advanced Search</h3>
              <p className="text-blue-700 text-sm mt-1">
                Use our advanced search to filter by price range, stock status, featured products, and more.
                Click the "Advanced Search" button above to get started.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedProductsPage