import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Shop: [
      { name: 'Laptops & Computers', href: '/products?category=laptops' },
      { name: 'Smartphones & Tablets', href: '/products?category=smartphones' },
      { name: 'Accessories', href: '/products?category=accessories' },
      { name: 'Gaming', href: '/products?category=gaming' },
      { name: 'Wearables', href: '/products?category=wearables' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping Policy', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Warranty', href: '/warranty' },
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
      { name: 'Affiliates', href: '/affiliates' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  }

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img 
                src="/logo.jpeg" 
                alt="AFORSEV Logo" 
                className="w-10 h-10 object-cover rounded-lg"
              />
              <span className="text-2xl font-bold">AFORSEV</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your trusted technology partner for the latest gadgets, electronics, 
              and tech accessories at unbeatable prices.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-primary-400" />
                <span>support@aforsev.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-primary-400" />
                <span>123 Tech Street, San Francisco, CA 94107</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">Stay Updated with Tech Trends</h3>
            <p className="text-gray-400 mb-6">
              Subscribe to our newsletter for exclusive deals, new arrivals, and tech tips.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="btn-primary bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} AFORSEV Technologies. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white">
                Cookie Policy
              </Link>
              <div className="flex items-center text-gray-400">
                Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> by AFORSEV Team
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="text-gray-400 text-sm">We accept:</div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">VISA</div>
            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">MC</div>
            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">AMEX</div>
            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">PP</div>
            <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center">AP</div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer