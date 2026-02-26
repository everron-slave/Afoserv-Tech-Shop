import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, ChevronDown, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../store/cartStore'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const [isProductsSubmenuOpen, setIsProductsSubmenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems } = useCartStore()
  const navigate = useNavigate()

  const categories = [
    { name: 'Laptops', path: '/products?category=laptops' },
    { name: 'Smartphones', path: '/products?category=smartphones' },
    { name: 'Accessories', path: '/products?category=accessories' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        {/* Top Row: Burger, Logo, Account/Cart */}
        <div className="flex justify-between items-center h-16">
          {/* Mobile: Left section - Burger menu */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-600 hover:text-primary-600 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile: Center - Logo */}
          <div className="md:hidden flex items-center justify-center flex-1">
            <Link to="/" className="flex items-center">
              <img
                src="/logo2.png"
                alt="AFORSEV Logo"
                className="w-10 h-10 object-cover rounded-lg"
              />
              <span className="text-lg font-bold text-gray-900 ml-2">AFORSEV</span>
            </Link>
          </div>

          {/* Desktop: Left section - Burger menu and logo tightly grouped */}
          <div className="hidden md:flex items-center">
            {/* Burger Menu */}
            <div className="relative">
              <button
                className="text-gray-600 hover:text-primary-600 p-2"
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Dropdown for Products & Services */}
              {isProductsDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50"
                  onMouseEnter={() => setIsProductsDropdownOpen(true)}
                  onMouseLeave={() => setIsProductsDropdownOpen(false)}
                >
                  <div className="py-2">
                    {/* Home */}
                    <Link
                      to="/"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      Home
                    </Link>

                    {/* Products with click-to-expand submenu */}
                    <div className="relative">
                      <button
                        className="flex justify-between items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-default"
                        onClick={() => setIsProductsSubmenuOpen(!isProductsSubmenuOpen)}
                      >
                        <span className="font-medium">Products</span>
                        <ChevronDown className={`w-4 h-4 transform transition-transform ${isProductsSubmenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Categories submenu */}
                      {isProductsSubmenuOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {categories.map((category) => (
                            <Link
                              key={category.name}
                              to={category.path}
                              className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary-600 rounded"
                              onClick={() => {
                                setIsProductsDropdownOpen(false)
                                setIsProductsSubmenuOpen(false)
                              }}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    <Link
                      to="/services"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      Services
                    </Link>

                    {/* Contact Us */}
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setIsProductsDropdownOpen(false)}
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Logo - Right next to burger menu with adjusted negative margin */}
            <Link to="/" className="flex items-center -ml-1">
              <img
                src="/logo2.png"
                alt="AFORSEV Logo"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 ml-2">AFORSEV</span>
            </Link>
          </div>

          {/* Right side - Cart and User (visible on both mobile and desktop) */}
          <div className="flex items-center space-x-4">
            <Link to="/login" className="p-2 text-gray-600 hover:text-primary-600">
              <User className="w-6 h-6" />
            </Link>
            
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Bottom Row: Search Bar (visible on both mobile and desktop) */}
        <div className="pb-3 md:pb-4">
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-r-lg transition-colors duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="px-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Home */}
              <Link
                to="/"
                className="px-4 text-gray-600 hover:text-primary-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Categories */}
              <div className="px-4">
                <div className="font-medium text-gray-700 mb-2">Products</div>
                <div className="ml-4 space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="block text-gray-600 hover:text-primary-600 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Services */}
              <Link
                to="/services"
                className="px-4 text-gray-600 hover:text-primary-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>

              {/* Mobile Contact Us */}
              <Link
                to="/contact"
                className="px-4 text-gray-600 hover:text-primary-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>

              {/* Mobile Cart */}
              <Link
                to="/cart"
                className="px-4 text-gray-600 hover:text-primary-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar