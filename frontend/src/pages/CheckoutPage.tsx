import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useNavigate } from 'react-router-dom';
import { usdToFcfaFormatted } from '../utils/currency';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/Loading';
import { EmptyCart } from '../components/EmptyState';

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { createOrder, simulatePayment, clearError, isLoading } = useOrderStore();
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
    country: 'CM',
    paymentMethod: 'cod',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty. Add some products before checkout.');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    clearError();
    
    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      
      const orderData = {
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: `Customer: ${formData.firstName} ${formData.lastName}, Phone: ${formData.phone}, Email: ${formData.email}`,
        cartId: 'current'
      };
      
      const order = await createOrder(orderData);
      setOrderId(order.id);
      
      if (formData.paymentMethod === 'cod') {
        setOrderSuccess(true);
        clearCart();
        toast.success('Order placed successfully! Payment will be collected on delivery.');
      } else {
        await simulatePayment(order.id, true);
        setOrderSuccess(true);
        clearCart();
        toast.success('Order placed successfully! Payment processed.');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      // Error toast is already handled by the store
    } finally {
      setIsSubmitting(false);
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
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                  </span>
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
              {formData.paymentMethod === 'cod' && (
                <p className="text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  <strong>Note:</strong> Your order will be processed once payment is received upon delivery.
                </p>
              )}
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue Shopping
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {items.length === 0 ? (
                <EmptyCart />
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
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>{usdToFcfaFormatted(totalPrice)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
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
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
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
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || items.length === 0}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
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