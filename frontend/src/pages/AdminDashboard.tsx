import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { usdToFcfaFormatted } from '../utils/currency';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      totalRevenue: 12540.75,
      totalOrders: 342,
      totalProducts: 156,
      totalUsers: 89,
      monthlyGrowth: 12.5,
      conversionRate: 3.2,
    };

    const mockRecentOrders = [
      { id: 'ORD-001', customer: 'John Doe', amount: 249.99, status: 'Delivered', date: '2024-01-15' },
      { id: 'ORD-002', customer: 'Jane Smith', amount: 149.50, status: 'Processing', date: '2024-01-14' },
      { id: 'ORD-003', customer: 'Bob Johnson', amount: 89.99, status: 'Shipped', date: '2024-01-13' },
      { id: 'ORD-004', customer: 'Alice Brown', amount: 299.99, status: 'Pending', date: '2024-01-12' },
      { id: 'ORD-005', customer: 'Charlie Wilson', amount: 179.50, status: 'Delivered', date: '2024-01-11' },
    ];

    const mockTopProducts = [
      { id: '1', name: 'Wireless Headphones', sales: 142, revenue: 28400, stock: 45 },
      { id: '2', name: 'Smart Watch', sales: 98, revenue: 19600, stock: 32 },
      { id: '3', name: 'Laptop Stand', sales: 76, revenue: 7600, stock: 67 },
      { id: '4', name: 'USB-C Hub', sales: 65, revenue: 6500, stock: 89 },
      { id: '5', name: 'Mechanical Keyboard', sales: 54, revenue: 10800, stock: 23 },
    ];

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setTopProducts(mockTopProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: usdToFcfaFormatted(stats.totalRevenue),
      icon: <DollarSign className="h-6 w-6" />,
      change: `${stats.monthlyGrowth}%`,
      trend: 'up',
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="h-6 w-6" />,
      change: '8.2%',
      trend: 'up',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: <Package className="h-6 w-6" />,
      change: '3.1%',
      trend: 'up',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      change: '15.7%',
      trend: 'up',
      color: 'bg-yellow-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Generate Report
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend === 'up' ? '↗' : '↘'} {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last month</span>
                  </div>
                </div>
                <div className={`${card.color} p-3 rounded-full`}>
                  <div className="text-white">{card.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usdToFcfaFormatted(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                View all orders →
              </button>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.sales}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                product.stock > 50 ? 'bg-green-500' : 
                                product.stock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(product.stock, 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{product.stock}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                View all products →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Package className="h-5 w-5 mr-2 text-gray-600" />
                <span>Add New Product</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Users className="h-5 w-5 mr-2 text-gray-600" />
                <span>Manage Users</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;