import { Trash2, Plus, Minus, ShoppingBag, Heart, Truck, Shield, Tag, Clock, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formatPrice, usdToFcfaFormatted } from '../utils/currency'
import { useState } from 'react'
import { EmptyCart } from '../components/EmptyState'

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, addItem } =
    useCartStore()
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, moveToCart: moveWishlistToCart, clearWishlist } =
    useWishlistStore()
  
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      toast.success('Item removed from cart')
    } else {
      updateQuantity(productId, quantity)
    }
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Cart cleared')
  }
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    
    setIsApplyingCoupon(true)
    // Simulate API call
    setTimeout(() => {
      const validCoupons: Record<string, number> = {
        'WELCOME10': 0.1,
        'SAVE20': 0.2,
        'FREESHIP': 0,
        'SUMMER25': 0.25
      }
      
      if (couponCode.toUpperCase() in validCoupons) {
        const discountRate = validCoupons[couponCode.toUpperCase()]
        const discountAmount = totalPrice * discountRate
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: discountAmount
        })
        toast.success(`Coupon "${couponCode.toUpperCase()}" applied!`)
      } else {
        toast.error('Invalid coupon code')
      }
      setIsApplyingCoupon(false)
    }, 500)
  }
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Coupon removed')
  }
  
  const handleSaveForLater = (productId: string) => {
    const item = items.find(item => item.productId === productId)
    if (!item) return
    
    if (wishlistItems.some(wishlistItem => wishlistItem.productId === productId)) {
      removeFromWishlist(productId)
      toast.success('Item removed from wishlist')
    } else {
      addToWishlist({
        productId: item.productId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl
      })
      toast.success('Item saved to wishlist')
    }
  }
  
  // Note: handleMoveToCart function is defined but not currently used in the UI
  // Keeping it commented for potential future use
  /*
  const handleMoveToCart = (productId: string) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId)
    if (!wishlistItem) return
    
    // Move from wishlist to cart
    const movedItem = moveWishlistToCart(productId)
    if (movedItem) {
      addItem({
        productId: movedItem.productId,
        name: movedItem.name,
        price: movedItem.price,
        quantity: 1,
        imageUrl: movedItem.imageUrl
      })
      toast.success('Item moved to cart')
    }
  }
  */
  
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId)
  }
  
  // Calculate totals with coupon discount
  const subtotal = totalPrice
  const shipping = totalPrice > 50 ? 0 : 5
  const tax = totalPrice * 0.08
  const discount = appliedCoupon?.discount || 0
  const grandTotal = subtotal + shipping + tax - discount

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Cart Items - Takes 2 columns */}
        <div className="lg:col-span-2">
          {/* Wishlist Section */}
          {wishlistItems.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-blue-600" />
                Wishlist ({wishlistItems.length})
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm sm:text-base">
                  You have {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      // Move all wishlist items to cart
                      wishlistItems.forEach(item => {
                        const movedItem = moveWishlistToCart(item.productId)
                        if (movedItem) {
                          addItem({
                            productId: movedItem.productId,
                            name: movedItem.name,
                            price: movedItem.price,
                            quantity: 1,
                            imageUrl: movedItem.imageUrl
                          })
                        }
                      })
                      toast.success('All wishlist items moved to cart')
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base tap-target"
                  >
                    Move all to cart
                  </button>
                  <button
                    onClick={() => clearWishlist()}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base tap-target"
                  >
                    Clear wishlist
                  </button>
                  <Link
                    to="/wishlist"
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm sm:text-base tap-target"
                  >
                    View wishlist
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex flex-col sm:flex-row items-start sm:items-center">
                {/* Product Image */}
                <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">{formatPrice(item.price)} each</p>
                      {/* Stock indicator */}
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${item.quantity > 5 ? 'bg-green-500' : item.quantity > 1 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-500">
                          {item.quantity > 5 ? 'In stock' : item.quantity > 1 ? 'Low stock' : 'Last item'}
                        </span>
                        <span className="mx-2 text-gray-300 hidden sm:inline">•</span>
                        <span className="text-sm text-gray-500 hidden sm:inline flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Ships in 1-2 days
                        </span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900 mt-2 sm:mt-0 sm:ml-4">
                      {usdToFcfaFormatted(item.price * item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100 tap-target"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 tap-target"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm sm:text-base tap-target"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                        <button
                          onClick={() => handleSaveForLater(item.productId)}
                          className="text-blue-600 hover:text-blue-700 flex items-center text-sm sm:text-base tap-target"
                        >
                          <Heart className={`w-4 h-4 mr-1 ${isInWishlist(item.productId) ? 'fill-current' : ''}`} />
                          {isInWishlist(item.productId) ? 'In wishlist' : 'Save for later'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Coupon Code Section */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Tag className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="font-medium text-gray-700">Have a coupon?</h3>
              </div>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-green-800">Coupon applied:</span>
                      <span className="ml-2 text-green-600">{appliedCoupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-700 hover:text-green-900 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-1 text-sm text-green-600">
                    -{usdToFcfaFormatted(appliedCoupon.discount)} discount applied
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-r-lg font-medium ${isApplyingCoupon || !couponCode.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Try codes: WELCOME10, SAVE20, SUMMER25
              </p>
            </div>
            
            {/* Order Summary Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">{usdToFcfaFormatted(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : usdToFcfaFormatted(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{usdToFcfaFormatted(tax)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="font-medium">-{usdToFcfaFormatted(discount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{usdToFcfaFormatted(grandTotal)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {shipping === 0 ? 'Free shipping applied' : 'Add $50 more for free shipping'}
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-gray-500">
                <div className="flex flex-col items-center">
                  <Truck className="w-6 h-6 mb-1" />
                  <span className="text-xs">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-6 h-6 mb-1" />
                  <span className="text-xs">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-6 h-6 mb-1" />
                  <span className="text-xs">30-Day Returns</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link
                to="/checkout"
                className="btn-primary w-full text-center block"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/products"
                className="btn-secondary w-full text-center block"
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleClearCart}
                className="w-full text-center text-gray-600 hover:text-gray-800 font-medium py-2"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage