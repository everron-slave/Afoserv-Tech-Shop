import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    
    // Mock registration - in real app, this would call API
    toast.success('Registration successful! Please check your email to verify your account.')
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">
            Join AFORSEV for the best shopping experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input pl-10"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pl-10 pr-10"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input pl-10 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mt-1"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">Or sign up with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social Sign Up */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Benefits of creating an account:
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              ✓
            </div>
            <span className="text-gray-700">
              Faster checkout with saved shipping details
            </span>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              ✓
            </div>
            <span className="text-gray-700">
              Track orders and view order history
            </span>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              ✓
            </div>
            <span className="text-gray-700">
              Access to exclusive deals and promotions
            </span>
          </li>
          <li className="flex items-start">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              ✓
            </div>
            <span className="text-gray-700">
              Save items to your wishlist for later
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default RegisterPage