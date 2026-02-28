import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formatPrice, usdToFcfaFormatted } from '../utils/currency'

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCartStore()

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

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-6">
          Add some products to your cart to see them here
        </p>
        <Link to="/products" className="btn-primary inline-block">
          Browse Products
        </Link>
      </div>
    )
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

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center">
            {/* Product Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
            <div className="flex-1 ml-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-gray-600">{formatPrice(item.price)} each</p>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {usdToFcfaFormatted(item.price * item.quantity)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.productId, item.quantity - 1)
                      }
                      className="p-2 hover:bg-gray-100"
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
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{usdToFcfaFormatted(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {totalPrice > 50 ? 'Free' : '$5.00'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">
              {usdToFcfaFormatted(totalPrice * 0.08)}
            </span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                {usdToFcfaFormatted(
                  totalPrice +
                  (totalPrice > 50 ? 0 : 5) +
                  totalPrice * 0.08
                )}
              </span>
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
        </div>
      </div>
    </div>
  )
}

export default CartPage