import { useState, useEffect, useCallback } from 'react'
import { Filter, X, ChevronDown, ChevronUp, DollarSign, Package, Star, Check } from 'lucide-react'
import { searchService, SearchFilters, SearchFiltersMetadata } from '../services/searchService'
import SearchAutocomplete from './SearchAutocomplete'
import { useNavigate, useLocation } from 'react-router-dom'

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  showFilters?: boolean
  compact?: boolean
}

const AdvancedSearch = ({
  onSearch,
  initialFilters = {},
  showFilters = true,
  compact = false,
}: AdvancedSearchProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filtersMetadata, setFiltersMetadata] = useState<SearchFiltersMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  // Parse filters from URL on mount and when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const parsedFilters = searchService.parseFiltersFromUrl(searchParams)
    setFilters(prev => ({ ...prev, ...parsedFilters }))
  }, [location.search])

  // Load filters metadata
  useEffect(() => {
    const loadFiltersMetadata = async () => {
      setIsLoadingMetadata(true)
      try {
        const result = await searchService.getFiltersMetadata()
        setFiltersMetadata(result.data)
      } catch (error) {
        console.error('Failed to load filters metadata:', error)
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    if (showFilters) {
      loadFiltersMetadata()
    }
  }, [showFilters])

  const handleSearch = useCallback((searchFilters: SearchFilters = filters) => {
    const queryString = searchService.buildUrlFromFilters(searchFilters)
    navigate(`/products?${queryString}`)
    
    if (onSearch) {
      onSearch(searchFilters)
    }
  }, [filters, navigate, onSearch])

  const handleInputChange = (key: keyof SearchFilters, value: any) => {
    const updatedFilters = { ...filters, [key]: value }
    setFilters(updatedFilters)
    
    // Auto-search for certain filters
    if (['category', 'inStock', 'featured', 'sort', 'order'].includes(key)) {
      handleSearch(updatedFilters)
    }
  }

  const handlePriceRangeChange = (min: number | undefined, max: number | undefined) => {
    const updatedFilters = { ...filters, minPrice: min, maxPrice: max }
    setFilters(updatedFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = { q: filters.q } // Keep search query
    setFilters(clearedFilters)
    handleSearch(clearedFilters)
  }

  const handleAutocompleteSearch = (query: string) => {
    const updatedFilters = { ...filters, q: query }
    setFilters(updatedFilters)
    handleSearch(updatedFilters)
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchAutocomplete
            placeholder="Search products by name, category, or description..."
            onSearch={handleAutocompleteSearch}
            initialValue={filters.q || ''}
            className="w-full"
          />
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-outline text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <div className="card p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => handleInputChange('category', undefined)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded ${!filters.category ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                >
                  <span>All Categories</span>
                  {!filters.category && <Check className="w-4 h-4" />}
                </button>
                {isLoadingMetadata ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : (
                  filtersMetadata?.categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleInputChange('category', category)}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded ${filters.category === category ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                    >
                      <span>{category}</span>
                      {filters.category === category && <Check className="w-4 h-4" />}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Min"
                    className="input flex-1"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceRangeChange(
                      e.target.value ? parseFloat(e.target.value) : undefined,
                      filters.maxPrice
                    )}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input flex-1"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceRangeChange(
                      filters.minPrice,
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )}
                    min="0"
                    step="0.01"
                  />
                </div>
                {filtersMetadata && (
                  <div className="text-xs text-gray-500">
                    Range: {formatPrice(filtersMetadata.priceRange.min)} - {formatPrice(filtersMetadata.priceRange.max)}
                  </div>
                )}
              </div>
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all' as const, label: 'All Products' },
                  { value: true, label: 'In Stock', icon: <Package className="w-4 h-4" /> },
                  { value: false, label: 'Out of Stock', icon: <Package className="w-4 h-4" /> },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleInputChange('inStock', option.value)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded ${filters.inStock === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {filters.inStock === option.value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Products
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all' as const, label: 'All Products' },
                  { value: true, label: 'Featured Only', icon: <Star className="w-4 h-4" /> },
                  { value: false, label: 'Non-Featured', icon: <Star className="w-4 h-4" /> },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleInputChange('featured', option.value)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded ${filters.featured === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'}`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                    {filters.featured === option.value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sorting Options */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'relevance' as const, label: 'Relevance' },
                { value: 'name' as const, label: 'Name' },
                { value: 'price' as const, label: 'Price' },
                { value: 'createdAt' as const, label: 'Newest' },
                { value: 'updatedAt' as const, label: 'Recently Updated' },
              ].map((sortOption) => (
                <button
                  key={sortOption.value}
                  type="button"
                  onClick={() => handleInputChange('sort', sortOption.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.sort === sortOption.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sortOption.label}
                </button>
              ))}
              
              {/* Order Toggle */}
              <button
                type="button"
                onClick={() => handleInputChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.order === 'asc' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {filters.order === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Active Filters ({activeFilterCount})
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                    Category: {filters.category}
                    <button
                      type="button"
                      onClick={() => handleInputChange('category', undefined)}
                      className="hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Price: {filters.minPrice !== undefined ? `$${filters.minPrice}` : 'Any'} - {filters.maxPrice !== undefined ? `$${filters.maxPrice}` : 'Any'}
                    <button
                      type="button"
                      onClick={() => handlePriceRangeChange(undefined, undefined)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.inStock !== undefined && filters.inStock !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Stock: {filters.inStock ? 'In Stock' : 'Out of Stock'}
                    <button
                      type="button"
                      onClick={() => handleInputChange('inStock', 'all')}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.featured !== undefined && filters.featured !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                    Featured: {filters.featured ? 'Yes' : 'No'}
                    <button
                      type="button"
                      onClick={() => handleInputChange('featured', 'all')}
                      className="hover:text-amber-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact View (for mobile or sidebar) */}
      {compact && showFilters && !showAdvancedFilters && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
              Category: {filters.category}
            </span>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Price Range
            </span>
          )}
          {filters.inStock !== undefined && filters.inStock !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {filters.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
          {filters.featured !== undefined && filters.featured !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
              {filters.featured ? 'Featured' : 'Non-Featured'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch