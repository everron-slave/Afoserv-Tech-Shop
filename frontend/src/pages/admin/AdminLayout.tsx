import { ReactNode, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Menu,
  X,
  User,
  Search,
  Bell,
  BarChart3
} from 'lucide-react';

interface SidebarItem {
  icon: ReactNode;
  label: string;
  path: string;
}

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders', path: '/admin/orders' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/admin/products' },
    { icon: <PlusCircle className="w-5 h-5" />, label: 'Add Product', path: '/admin/add-product' },
  ];

  const getPageTitle = () => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 shadow-sm"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">E-commerce Management</p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors
                    ${location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{getPageTitle()}</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your e-commerce store</p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User avatar */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;