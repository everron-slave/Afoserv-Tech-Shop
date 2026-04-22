import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/currency'
import { useProductStore } from '../store/productStore'

const HomePage = () => {
  // Use productStore as centralized product source
  const { products, fetchProducts } = useProductStore()
  
  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Filter products for slideshow (featured products)
  const featuredProducts = products.filter(p => p.featured)
  
  // Filter products by category
  const ubiquitiProducts = products.filter(p => p.category === 'UBIQUITI')
  const hddProducts = products.filter(p => p.category === 'HDD')
  const hpeProducts = products.filter(p => p.category === 'HPE AURA SWITCHES')
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Auto-rotate slideshow
  useEffect(() => {
    let timeoutId: number;
    
    const rotateSlide = () => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      timeoutId = window.setTimeout(rotateSlide, 8000);
    };
    
    timeoutId = window.setTimeout(rotateSlide, 8000);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [featuredProducts.length]);

  // State for three-column solutions grid
  const [activeCard, setActiveCard] = useState<'business' | 'public' | 'home' | null>(null)

  const handleCardClick = (card: 'business' | 'public' | 'home') => {
    setActiveCard(card)
  }

  const closeModal = useCallback(() => {
    setActiveCard(null)
  }, [])

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCard) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeCard, closeModal])

  return (
    <div className="space-y-16">
      {/* Product Slideshow Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] md:h-[600px]">
          <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
               style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-full h-full relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/50"></div>
                </div>
                
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">{product.name}</h1>
                      <p className="text-base md:text-lg lg:text-xl mb-4 md:mb-6 text-gray-200">{product.description}</p>
                      <div className="flex items-center mb-6">
                        <span className="text-xl md:text-2xl lg:text-3xl font-bold">{formatPrice(product.price)}</span>
                        <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm">Free Shipping</span>
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        className="btn-primary bg-white text-gray-900 hover:bg-gray-100 inline-flex items-center px-6 py-3 rounded-lg font-semibold text-base"
                      >
                        Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories Sections */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center">Our Products</h2>
        
        {/* UBIQUITI Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold">UBIQUITI Networking</h3>
            <Link
              to="/products?category=UBIQUITI"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {ubiquitiProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* HDD Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold">Hard Disk Drives (HDD)</h3>
            <Link
              to="/products?category=HDD"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {hddProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Category Row */}
        <div className="mb-16">
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide md:overflow-visible md:mx-0 md:px-0">
            <div className="flex space-x-8 min-w-max md:min-w-0 md:w-full md:flex md:flex-wrap md:justify-center md:gap-8">
              {[
                { name: 'Projectors', image: 'https://images.unsplash.com/photo-1589113050289-1c654e7e305d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvamVjdG9yfGVufDB8fDB8fHww', link: '/products?category=projectors' },
                { name: 'Screens', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', link: '/products?category=screens' },
                { name: 'Displays', image: 'https://images.unsplash.com/photo-1712903911043-1f9226c43c8d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW50ZXJhY3RpdmUlMjBzY3JlZW58ZW58MHx8MHx8fDA%3D', link: '/products?category=displays' },
                { name: 'Monitors', image: 'https://images.unsplash.com/photo-1598986646512-9330bcc4c0dc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9uaXRvcnN8ZW58MHx8MHx8fDA%3D', link: '/products?category=monitors' },
                { name: 'LED Walls', image: 'https://images.visunextgroup.com/images/D/750/2/1000028782/en/nec/NEC-LED-E015i-135-135-LED-Wall-Full-HD-1-5mm-Pixel-Pitch.webp', link: '/products?category=led-walls' },
                { name: 'Video Conferencing Systems', image: 'https://images.visunextgroup.com/images/D/750/1/1000034323/en/poly/Poly-Studio-X72-Premium-All-In-One-video-bar-for-large-conference-rooms.webp', link: '/products?category=video-conferencing' },
                { name: 'Audio', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop', link: '/products?category=audio' },
              ].map((category) => (
                <Link
                  key={category.name}
                  to={category.link}
                  className="flex flex-col items-center flex-shrink-0 w-32 md:w-auto md:mx-2"
                >
                  <div className="relative w-32 h-32 mb-4">
                    <div className="absolute inset-0 bg-[#7DC4D1] rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-24 h-24 object-cover rounded-full transform hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-center text-sm md:text-base">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* HPE AURA SWITCHES Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold">HPE AURA SWITCHES</h3>
            <Link
              to="/products?category=HPE AURA SWITCHES"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {hpeProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Three-column Solutions Grid */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-center">Custom Solutions for Every Need</h2>
          
          <div className="flex md:grid md:grid-cols-3 gap-6 mb-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
            {/* Business Solutions Card */}
            <div
              className={`relative h-96 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink ${activeCard === 'business' ? 'ring-4 ring-blue-500' : 'hover:scale-[1.02]'}`}
              onClick={() => handleCardClick('business')}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop')` }}
              ></div>
              <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
                <button className="bg-white text-blue-700 font-bold px-4 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-100 transition-colors duration-300 text-sm md:text-base">
                  Business Solutions
                </button>
              </div>
            </div>

            {/* Public Sector Solutions Card */}
            <div
              className={`relative h-96 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink ${activeCard === 'public' ? 'ring-4 ring-purple-500' : 'hover:scale-[1.02]'}`}
              onClick={() => handleCardClick('public')}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('https://www.visunext.co.uk/thumbnail/61/07/f4/1662727571/loesungen-oeffentliche-auftraggeber_640x640.webp')` }}
              ></div>
              <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
                <button className="bg-white text-purple-700 font-bold px-4 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-100 transition-colors duration-300 text-sm md:text-base">
                  Public Sector Solutions
                </button>
              </div>
            </div>

            {/* Home Entertainment Solutions Card */}
            <div
              className={`relative h-96 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 min-w-[85vw] md:min-w-0 flex-shrink-0 md:flex-shrink ${activeCard === 'home' ? 'ring-4 ring-green-500' : 'hover:scale-[1.02]'}`}
              onClick={() => handleCardClick('home')}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGl2aW5nJTIwcm9vbSUyMHdpdGglMjB0dnxlbnwwfHwwfHx8MA%3D%3D')` }}
              ></div>
              <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
                <button className="bg-white text-green-700 font-bold px-4 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-100 transition-colors duration-300 text-sm md:text-base">
                  Home Entertainment Solutions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Popup for Solutions */}
      {activeCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold">
                  {activeCard === 'business' && 'Business Solutions'}
                  {activeCard === 'public' && 'Public Sector Solutions'}
                  {activeCard === 'home' && 'Home Entertainment Solutions'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-base md:text-lg mb-4 md:mb-6">
                  {activeCard === 'business' && 'Transform your business with cutting-edge technology solutions designed for enterprise needs. Our team of experts provides end-to-end implementation, from network infrastructure to cloud migration and cybersecurity.'}
                  {activeCard === 'public' && 'Enhance public services with reliable, secure technology infrastructure tailored for government and public sector organizations. We specialize in compliant solutions that meet regulatory requirements while improving citizen services.'}
                  {activeCard === 'home' && 'Create immersive home entertainment experiences with premium audio-visual systems and smart home integration. From home theaters to whole-house audio, we design and install systems that transform your living space.'}
                </p>
                
                <div className="mt-8 space-y-4">
                  <h4 className="font-bold text-base md:text-lg">Key Features:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {activeCard === 'business' && (
                      <>
                        <li>Enterprise network design and implementation</li>
                        <li>Cloud migration and management</li>
                        <li>Cybersecurity and data protection</li>
                        <li>24/7 monitoring and support</li>
                        <li>Custom software solutions</li>
                      </>
                    )}
                    {activeCard === 'public' && (
                      <>
                        <li>Secure government network infrastructure</li>
                        <li>Compliance with regulatory standards</li>
                        <li>Citizen service portal development</li>
                        <li>Data analytics and reporting</li>
                        <li>Disaster recovery planning</li>
                      </>
                    )}
                    {activeCard === 'home' && (
                      <>
                        <li>Custom home theater design</li>
                        <li>Whole-house audio and video distribution</li>
                        <li>Smart home automation</li>
                        <li>Lighting control systems</li>
                        <li>Professional installation and calibration</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button className="btn-primary px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base">
                    Request a Consultation
                  </button>
                  <button className="px-4 py-2 md:px-6 md:py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm md:text-base">
                    View Case Studies
                  </button>
                  <button onClick={closeModal} className="px-4 py-2 md:px-6 md:py-3 text-gray-600 hover:text-gray-900 font-semibold text-sm md:text-base">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
