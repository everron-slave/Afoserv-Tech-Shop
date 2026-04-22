import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, ChevronDown, Search, User, LogOut, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore, useIsAdmin } from '../store/authStore'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const { totalItems } = useCartStore()
  const { user, isAuthenticated, logout, initialize } = useAuthStore()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const toggleMobileCategory = (categoryId: string) => {
    setExpandedMobileCategory(expandedMobileCategory === categoryId ? null : categoryId)
  }

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated && !user) {
        await initialize();
      }
    };
    initAuth();
  }, [isAuthenticated, user, initialize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    if (isProductsDropdownOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProductsDropdownOpen, isUserDropdownOpen])

  // Mega menu categories with French names (translatable) - Updated to match user's list exactly
  const megaMenuCategories = [
    {
      id: 'telecom',
      name: 'Télécommunications & navigation',
      subcategories: [
        { name: 'Équipements de conférence', path: '/products?category=conference-equipment' },
        { name: 'Équipements de communication radio', path: '/products?category=radio-communication' },
        { name: 'Équipements téléphoniques', path: '/products?category=telephone-equipment' },
        { name: 'Composants intelligents', path: '/products?category=smart-components' },
        { name: 'Dispositifs de navigation mobile', path: '/products?category=mobile-navigation' },
        { name: 'Équipements de numérisation', path: '/products?category=digitization-equipment' },
      ]
    },
    {
      id: 'computing',
      name: 'Informatique & électronique',
      subcategories: [
        { name: 'Réseaux', path: '/products?category=networks' },
        { name: 'Composants', path: '/products?category=components' },
        { name: 'Ordinateurs', path: '/products?category=computers' },
        { name: 'Logiciels', path: '/products?category=software' },
        { name: 'Imprimantes et scanners', path: '/products?category=printers-scanners' },
        { name: 'Stockage de données', path: '/products?category=data-storage' },
      ]
    },
    {
      id: 'automation',
      name: 'Automatisation de la maison & sécurité',
      subcategories: [
        { name: 'Systèmes de surveillance', path: '/products?category=surveillance-systems' },
        { name: 'Accès et contrôles', path: '/products?category=access-controls' },
        { name: 'Capteurs et alarmes', path: '/products?category=sensors-alarms' },
        { name: 'Produits de sécurité', path: '/products?category=security-products' },
        { name: 'Protection contre le feu', path: '/products?category=fire-protection' },
      ]
    },
    {
      id: 'electrical',
      name: 'Équipements électriques et fournitures',
      subcategories: [
        { name: 'Câblage', path: '/products?category=wiring' },
        { name: 'Protections électriques', path: '/products?category=electrical-protections' },
        { name: 'Générateurs', path: '/products?category=generators' },
        { name: 'Boîtiers électriques', path: '/products?category=electrical-enclosures' },
      ]
    },
    {
      id: 'photovoltaic',
      name: 'Photovoltaïque',
      subcategories: [
        { name: 'Panneaux solaires', path: '/products?category=solar-panels' },
        { name: 'Onduleurs', path: '/products?category=inverters' },
        { name: 'Batteries', path: '/products?category=batteries' },
        { name: 'Systèmes de stockage', path: '/products?category=storage-systems' },
      ]
    },
    {
      id: 'audiovisual',
      name: 'Équipements audiovisuels',
      subcategories: [
        { name: 'Fournitures de présentation', path: '/products?category=presentation-supplies' },
        { name: 'Casques audio', path: '/products?category=headphones' },
        { name: 'Projecteurs', path: '/products?category=projectors' },
        { name: 'Télévisions', path: '/products?category=tvs' },
      ]
    }
  ]

  // Category tab items for the new navigation bar
  const categoryTabItems = [
    { name: 'Burger Menu', path: '#', icon: 'menu' },
    { name: 'Configurators', path: '/products?category=configurators' },
    { name: 'Network Equipments', path: '/products?category=network-equipments' },
    { name: 'Server Solutions', path: '/products?category=server-solutions' },
    { name: 'Food', path: '/products?category=food' },
    { name: 'Software', path: '/products?category=software' },
    { name: 'PC Deal', path: '/products?category=pc-deal' },
    { name: 'Heat Pump & Solar Panel', path: '/products?category=heat-pump-solar' },
    { name: 'AI', path: '/products?category=ai' },
    { name: 'Others', path: '/products?category=others' },
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
        {/* Top Row: Logo, Account/Cart */}
        <div className="flex justify-between items-center h-16">
          {/* Desktop: Logo on left */}
          <div className="hidden md:flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo2.png"
                alt="AFORSEV Logo"
                className="w-12 h-12 object-cover rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 ml-2">AFOSERV</span>
            </Link>
          </div>

          {/* Mobile: Logo centered */}
          <div className="md:hidden flex items-center justify-center flex-1">
            <Link to="/" className="flex items-center">
              <img
                src="/logo2.png"
                alt="AFORSEV Logo"
                className="w-10 h-10 object-cover rounded-lg"
              />
              <span className="text-lg font-bold text-gray-900 ml-2">AFOSERV</span>
            </Link>
          </div>

          {/* Right side - Cart and User (visible on both mobile and desktop) */}
          <div className="flex items-center space-x-4">
            {/* User dropdown */}
            <div className="relative" ref={userDropdownRef}>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </button>
                  
                  {/* User dropdown menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user?.role}
                          </span>
                        </p>
                      </div>
                      
                      <div className="p-2">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        
                        <button
                          onClick={async () => {
                            setIsUserDropdownOpen(false)
                            await logout()
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="p-2 text-gray-600 hover:text-primary-600">
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>
            
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

        {/* Category Tab - Below search bar */}
        <div className="border-t border-gray-200">
          {/* Desktop: Full category tab */}
          <div className="hidden md:block">
            <div className="flex items-center bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-2">
              {/* Burger Menu for desktop category tab */}
              <div className="relative mr-4" ref={dropdownRef}>
                <button
                  className="flex items-center text-gray-700 hover:text-primary-700 font-medium py-1 px-3 rounded-md hover:bg-white/50 transition-colors relative z-10"
                  onClick={() => {
                    console.log('Burger menu clicked, toggling dropdown')
                    setIsProductsDropdownOpen(!isProductsDropdownOpen)
                  }}
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Mega Menu Dropdown */}
                {isProductsDropdownOpen && (
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 w-screen max-w-screen bg-white rounded-lg shadow-xl border z-50 overflow-hidden transition-all duration-300 ease-in-out animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6">
                      {/* Mega Menu Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {megaMenuCategories.map((category) => (
                          <div key={category.id} className="space-y-3">
                            {/* Category Header */}
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                              {category.name}
                            </h3>
                            
                            {/* Subcategories */}
                            <ul className="space-y-2">
                              {category.subcategories.map((subcategory) => (
                                <li key={subcategory.name}>
                                  <Link
                                    to={subcategory.path}
                                    className="text-gray-600 hover:text-primary-700 text-sm transition-colors duration-200 block py-1 hover:translate-x-1 transform transition-transform"
                                    onClick={() => setIsProductsDropdownOpen(false)}
                                  >
                                    {subcategory.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bottom Links */}
                      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
                        <Link
                          to="/products"
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                          onClick={() => setIsProductsDropdownOpen(false)}
                        >
                          View All Products →
                        </Link>
                        <Link
                          to="/services"
                          className="text-gray-600 hover:text-primary-700 text-sm"
                          onClick={() => setIsProductsDropdownOpen(false)}
                        >
                          Professional Services
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category items */}
              <div className="flex items-center space-x-6 overflow-x-auto py-1">
                {categoryTabItems.slice(1).map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-gray-700 hover:text-primary-700 font-medium whitespace-nowrap py-1 px-2 rounded-md hover:bg-white/50 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Burger menu with "Select Category" */}
          <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3">
            <button
              className="flex items-center text-gray-700 hover:text-primary-700 font-medium"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 mr-2" />
              ) : (
                <Menu className="w-5 h-5 mr-2" />
              )}
              <span>Select Category</span>
            </button>
          </div>
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

              {/* Mobile Mega Menu Categories (Accordion) */}
              <div className="px-4">
                <div className="font-medium text-gray-700 mb-3 text-lg">Categories</div>
                <div className="space-y-2">
                  {megaMenuCategories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Category Header (Accordion Trigger) */}
                      <button
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium text-left transition-colors duration-200"
                        onClick={() => toggleMobileCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transform transition-transform duration-300 ${
                            expandedMobileCategory === category.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Subcategories (Accordion Content) */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          expandedMobileCategory === category.id ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-4 py-3 bg-white space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.name}
                              to={subcategory.path}
                              className="block text-gray-600 hover:text-primary-700 py-2 pl-4 border-l-2 border-gray-200 hover:border-primary-500 transition-all duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Bottom Links */}
              <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
                <Link
                  to="/services"
                  className="block text-gray-600 hover:text-primary-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Professional Services
                </Link>
                <Link
                  to="/contact"
                  className="block text-gray-600 hover:text-primary-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  to="/cart"
                  className="block text-gray-600 hover:text-primary-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar