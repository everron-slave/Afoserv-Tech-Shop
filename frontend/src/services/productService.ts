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
    const response = await api.post('/api/products', productData)
    return response.data
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