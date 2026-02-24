import { Product, ProductFilters } from './productService'

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    description: 'Apple M3 Pro chip, 36GB RAM, 1TB SSD',
    price: 2499,
    category: 'Laptops',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    stock: 15,
    featured: true,
    active: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Titanium design, A17 Pro chip, 256GB',
    price: 999,
    category: 'Smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
    stock: 42,
    featured: true,
    active: true,
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation',
    price: 399,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 28,
    featured: false,
    active: true,
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
  },
  {
    id: '4',
    name: 'Dell XPS 15',
    description: 'Intel Core i9, 32GB RAM, 1TB SSD, OLED display',
    price: 2199,
    category: 'Laptops',
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5',
    stock: 8,
    featured: false,
    active: true,
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-12T11:45:00Z',
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24',
    description: 'Dynamic AMOLED 2X, 256GB, AI features',
    price: 899,
    category: 'Smartphones',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf',
    stock: 35,
    featured: true,
    active: true,
    createdAt: '2024-01-08T16:30:00Z',
    updatedAt: '2024-01-08T16:30:00Z',
  },
  {
    id: '6',
    name: 'Logitech MX Master 3S',
    description: 'Wireless mouse with MagSpeed scrolling',
    price: 99,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db',
    stock: 67,
    featured: false,
    active: true,
    createdAt: '2024-01-03T13:10:00Z',
    updatedAt: '2024-01-03T13:10:00Z',
  },
  {
    id: '7',
    name: 'iPad Pro 12.9"',
    description: 'M2 chip, Liquid Retina XDR display, 1TB',
    price: 1499,
    category: 'Tablets',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    stock: 22,
    featured: true,
    active: true,
    createdAt: '2024-01-18T08:45:00Z',
    updatedAt: '2024-01-18T08:45:00Z',
  },
  {
    id: '8',
    name: 'Apple Watch Series 9',
    description: 'GPS + Cellular, 45mm, Aluminum case',
    price: 499,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6',
    stock: 51,
    featured: false,
    active: true,
    createdAt: '2024-01-14T12:20:00Z',
    updatedAt: '2024-01-14T12:20:00Z',
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockProductService = {
  // Get all products with optional filters
  async getProducts(filters: ProductFilters = {}) {
    await delay(300) // Simulate network delay
    
    let filteredProducts = [...mockProducts]
    
    // Apply filters
    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(
        product => product.category === filters.category
      )
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product => product.featured)
    }
    
    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price >= filters.minPrice!
      )
    }
    
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price <= filters.maxPrice!
      )
    }
    
    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 12
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
    }
  },

  // Get single product by ID
  async getProduct(id: string) {
    await delay(200)
    
    const product = mockProducts.find(p => p.id === id)
    
    if (!product) {
      throw new Error('Product not found')
    }
    
    return {
      success: true,
      data: product,
    }
  },

  // Get product categories
  async getCategories() {
    await delay(100)
    
    const categories = Array.from(new Set(mockProducts.map(p => p.category)))
    
    return {
      success: true,
      data: categories,
    }
  },

  // Create product (mock implementation)
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    await delay(400)
    
    const newProduct: Product = {
      ...productData,
      id: (mockProducts.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    mockProducts.push(newProduct)
    
    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    }
  },

  // Update product (mock implementation)
  async updateProduct(id: string, productData: Partial<Product>) {
    await delay(300)
    
    const index = mockProducts.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error('Product not found')
    }
    
    const updatedProduct = {
      ...mockProducts[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    }
    
    mockProducts[index] = updatedProduct
    
    return {
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    }
  },

  // Delete product (mock implementation)
  async deleteProduct(id: string) {
    await delay(250)
    
    const index = mockProducts.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error('Product not found')
    }
    
    mockProducts.splice(index, 1)
    
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  },
}