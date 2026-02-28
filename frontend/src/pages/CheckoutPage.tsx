import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { formatPrice, usdToFcfaFormatted } from '../utils/currency';

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    paymentMethod: 'card',
    saveInfo: false,
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Your cart is empty. Add some products before checkout.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate a successful order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setOrderId(mockOrderId);
      setOrderSuccess(true);
      
      // Clear cart after successful order
      clearCart();
      
      // In a real app, you would redirect to order confirmation page
      console.log('Order placed successfully:', {
        orderId: mockOrderId,
        items,
        totalPrice,
        customerInfo: formData,
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Order Confirmed!</h2>
              <p className="mt-2 text-lg text-gray-600">Thank you for your purchase.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{usdToFcfaFormatted(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{items.length} items</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                A confirmation email has been sent to <span className="font-medium">{formData.email}</span>.
              </p>
              <p className="text-gray-600">
                You can track your order status in your account dashboard.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-white text-indigo-600 border border-indigo-600 py-3 px-4 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded"
                            />
                          )}
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {usdToFcfaFormatted(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{usdToFcfaFormatted(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">FCFA0.00</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">FCFA0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>{usdToFcfaFormatted(totalPrice)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right column - Checkout form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP / Postal code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="CM">Cameroon</option>
                    <option value="CV">Cote d'ivore</option>
                    <option value="NG">Nigeria</option>
                    <option value="GA">Gabon</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="card"
                      name="paymentMethod"
                      type="radio"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit / Debit Card
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="paypal"
                      name="paymentMethod"
                      type="radio"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                      PayPal
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="cod"
                      name="paymentMethod"
                      type="radio"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="orange-money"
                      name="paymentMethod"
                      type="radio"
                      value="orange-money"
                      checked={formData.paymentMethod === 'orange-money'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="orange-money" className="ml-3 block text-sm font-medium text-gray-700">
                      Orange Money
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="mtn-mobile-money"
                      name="paymentMethod"
                      type="radio"
                      value="mtn-mobile-money"
                      checked={formData.paymentMethod === 'mtn-mobile-money'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="mtn-mobile-money" className="ml-3 block text-sm font-medium text-gray-700">
                      MTN Mobile Money
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <input
                    id="saveInfo"
                    name="saveInfo"
                    type="checkbox"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveInfo" className="ml-2 block text-sm text-gray-900">
                    Save this information for next time
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isProcessing || items.length === 0}
                  className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isProcessing || items.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291a7.962 7.962 0 016.2-2.291l1.517-2.186A9.96 9.96 0 0012 2C6.477 2 2 6.477 2 12h4zm2 5.291l3.293 3.293a1 1 0 001.414 0l3.293-3.293H6z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Place Order - ${usdToFcfaFormatted(totalPrice)}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;