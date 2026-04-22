import api from './api'

export interface SearchFilters {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean | 'all'
  featured?: boolean | 'all'
  specifications?: Record<string, any>
  page?: number
  limit?: number
  sort?: 'relevance' | 'name' | 'price' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface SearchResult {
  success: boolean
  data: any[]
  metadata: {
    search: {
      query: string
      filters: {
        category: string
        priceRange: {
          min: number | null
          max: number | null
        }
        inStock: string
        featured: string
      }
    }
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    sorting: {
      field: string
      order: string
    }
  }
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'popular'
  id: string | null
  text: string
  category: string
}

export interface SearchFiltersMetadata {
  categories: string[]
  priceRange: {
    min: number
    max: number
    avg: number
  }
  stock: {
    inStock: number
    outOfStock: number
  }
  featured: number
  total: number
}

export interface PopularSearch {
  term: string
  type: 'product' | 'category'
  count: number
}

export const searchService = {
  // Advanced search with filters and sorting
  async advancedSearch(filters: SearchFilters = {}): Promise<SearchResult> {
    const params = new URLSearchParams()
    
    if (filters.q) params.append('q', filters.q)
    if (filters.category) params.append('category', filters.category)
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.inStock !== undefined && filters.inStock !== 'all') {
      params.append('inStock', filters.inStock.toString())
    }
    if (filters.featured !== undefined && filters.featured !== 'all') {
      params.append('featured', filters.featured.toString())
    }
    if (filters.specifications) {
      params.append('specifications', JSON.stringify(filters.specifications))
    }
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.order) params.append('order', filters.order)

    const queryString = params.toString()
    const url = `/api/search${queryString ? `?${queryString}` : ''}`

    const response = await api.get(url)
    return response.data
  },

  // Get search suggestions/autocomplete
  async getSuggestions(query: string, limit: number = 10): Promise<{
    success: boolean
    data: SearchSuggestion[]
    metadata: {
      query: string
      total: number
    }
  }> {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const url = `/api/search/suggestions${queryString ? `?${queryString}` : ''}`

    const response = await api.get(url)
    return response.data
  },

  // Get search filters metadata
  async getFiltersMetadata(): Promise<{
    success: boolean
    data: SearchFiltersMetadata
  }> {
    const response = await api.get('/api/search/filters')
    return response.data
  },

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<{
    success: boolean
    data: PopularSearch[]
    metadata: {
      total: number
      updatedAt: string
    }
  }> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())

    const queryString = params.toString()
    const url = `/api/search/popular${queryString ? `?${queryString}` : ''}`

    const response = await api.get(url)
    return response.data
  },

  // Helper to build filter state from URL
  parseFiltersFromUrl(searchParams: URLSearchParams): SearchFilters {
    const filters: SearchFilters = {}
    
    const q = searchParams.get('q')
    if (q) filters.q = q
    
    const category = searchParams.get('category')
    if (category) filters.category = category
    
    const minPrice = searchParams.get('minPrice')
    if (minPrice) filters.minPrice = parseFloat(minPrice)
    
    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice)
    
    const inStock = searchParams.get('inStock')
    if (inStock === 'true') filters.inStock = true
    else if (inStock === 'false') filters.inStock = false
    
    const featured = searchParams.get('featured')
    if (featured === 'true') filters.featured = true
    else if (featured === 'false') filters.featured = false
    
    const page = searchParams.get('page')
    if (page) filters.page = parseInt(page)
    
    const limit = searchParams.get('limit')
    if (limit) filters.limit = parseInt(limit)
    
    const sort = searchParams.get('sort') as SearchFilters['sort']
    if (sort && ['relevance', 'name', 'price', 'createdAt', 'updatedAt'].includes(sort)) {
      filters.sort = sort
    }
    
    const order = searchParams.get('order') as SearchFilters['order']
    if (order && ['asc', 'desc'].includes(order)) {
      filters.order = order
    }
    
    return filters
  },

  // Helper to build URL from filters
  buildUrlFromFilters(filters: SearchFilters): string {
    const params = new URLSearchParams()
    
    if (filters.q) params.append('q', filters.q)
    if (filters.category) params.append('category', filters.category)
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.inStock !== undefined && filters.inStock !== 'all') {
      params.append('inStock', filters.inStock.toString())
    }
    if (filters.featured !== undefined && filters.featured !== 'all') {
      params.append('featured', filters.featured.toString())
    }
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.order) params.append('order', filters.order)
    
    return params.toString()
  },
}