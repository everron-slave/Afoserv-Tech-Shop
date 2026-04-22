import api from './api'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
  featured: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  page?: number
  limit?: number
}

export const productService = {
  // Get all products with optional filters
  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams()
    
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.featured) params.append('featured', 'true')
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = `/api/products${queryString ? `?${queryString}` : ''}`

    const response = await api.get(url)
    return response.data
  },

  // Get single product by ID
  async getProduct(id: string) {
    const response = await api.get(`/api/products/${id}`)
    return response.data
  },

  // Create product (admin only)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    console.log('📦 Creating product with data:', productData)
    console.log('🌐 API base URL:', api.defaults.baseURL)
    console.log('🔗 Full URL:', `${api.defaults.baseURL}/api/products`)
    
    try {
      const response = await api.post('/api/products', productData)
      console.log('✅ Product created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to create product:', error)
      console.error('📊 Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      })
      throw error
    }
  },

  // Update product (admin only)
  async updateProduct(id: string, productData: Partial<Product>) {
    const response = await api.put(`/api/products/${id}`, productData)
    return response.data
  },

  // Delete product (admin only)
  async deleteProduct(id: string) {
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  },

  // Get product categories
  async getCategories() {
    const response = await api.get('/api/products/categories')
    return response.data
  },
}