import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminDashboard from './pages/AdminDashboard' // Keep old dashboard for now
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'

// New admin components
import AdminLayout from './pages/admin/AdminLayout'
import AdminProductsPage from './pages/admin/ProductsPage'
import AdminProductFormPage from './pages/admin/ProductFormPage'
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard'
import OrdersPage from './pages/admin/OrdersPage'

// Protected routes
import { ProtectedRoute, AdminRoute, AuthRoute } from './components/ProtectedRoute'

// Error boundary
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes with Navbar and Footer */}
          <Route element={
            <>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Outlet />
              </main>
              <Footer />
            </>
          }>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Auth routes - only accessible when not authenticated */}
            <Route path="/login" element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } />
            <Route path="/register" element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            } />
          </Route>
          
          {/* Old admin dashboard (keep for backward compatibility) */}
          <Route path="/admin-old" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* New admin panel with its own layout (no Navbar/Footer) */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminProductsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="add-product" element={<AdminProductFormPage />} />
            <Route path="edit-product/:id" element={<AdminProductFormPage />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App