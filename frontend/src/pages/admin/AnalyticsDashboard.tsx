import { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download
} from 'lucide-react';
import { usdToFcfaFormatted } from '../../utils/currency';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);

  // Mock data for demonstration
  const mockSalesData = [
    { date: 'Jan 1', sales: 12000 },
    { date: 'Jan 8', sales: 19000 },
    { date: 'Jan 15', sales: 15000 },
    { date: 'Jan 22', sales: 22000 },
    { date: 'Jan 29', sales: 18000 },
    { date: 'Feb 5', sales: 25000 },
    { date: 'Feb 12', sales: 21000 },
  ];

  const mockRevenueData = [
    { month: 'Jan', revenue: 125400, orders: 342 },
    { month: 'Feb', revenue: 142300, orders: 389 },
    { month: 'Mar', revenue: 168900, orders: 421 },
    { month: 'Apr', revenue: 154200, orders: 398 },
    { month: 'May', revenue: 189500, orders: 456 },
    { month: 'Jun', revenue: 210300, orders: 512 },
  ];

  const mockCustomerData = [
    { segment: 'New Customers', value: 45, color: 'bg-blue-500' },
    { segment: 'Returning Customers', value: 35, color: 'bg-green-500' },
    { segment: 'Inactive Customers', value: 20, color: 'bg-gray-300' },
  ];

  const mockInventoryData = [
    { category: 'Electronics', stock: 156, lowStock: 23, color: 'bg-purple-500' },
    { category: 'Computers', stock: 89, lowStock: 12, color: 'bg-blue-500' },
    { category: 'Phones', stock: 142, lowStock: 18, color: 'bg-green-500' },
    { category: 'Accessories', stock: 234, lowStock: 8, color: 'bg-yellow-500' },
    { category: 'Networking', stock: 67, lowStock: 15, color: 'bg-red-500' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSalesData(mockSalesData);
      setRevenueData(mockRevenueData);
      setCustomerData(mockCustomerData);
      setInventoryData(mockInventoryData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: usdToFcfaFormatted(210300),
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: '512',
      change: '+8.2%',
      trend: 'up',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Customers',
      value: '2,845',
      change: '+15.7%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: '+0.4%',
      trend: 'up',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-yellow-500',
    },
  ];

  const topProducts = [
    { name: 'Ubiquiti Access Point', sales: 142, revenue: 28400, growth: '+12%' },
    { name: 'HP EliteBook Laptop', sales: 98, revenue: 19600, growth: '+8%' },
    { name: 'Samsung SSD 1TB', sales: 76, revenue: 15200, growth: '+15%' },
    { name: 'Apple MacBook Pro', sales: 65, revenue: 19500, growth: '+5%' },
    { name: 'HPE Aruba Switch', sales: 54, revenue: 16200, growth: '+22%' },
  ];

  const exportData = () => {
    // Simple export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Change\n"
      + kpiCards.map(card => 
          `"${card.title}","${card.value}","${card.change}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your e-commerce performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                <div className={`${card.color.replace('bg-', 'text-')}`}>
                  {card.icon}
                </div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              {card.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
              <p className="text-sm text-gray-500">Daily sales performance</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end space-x-2">
            {salesData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t"
                  style={{ height: `${(item.sales / 25000) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">{item.date}</div>
                <div className="text-sm font-medium mt-1">{usdToFcfaFormatted(item.sales)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue by Month</h3>
              <p className="text-sm text-gray-500">Monthly revenue and orders</p>
            </div>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {revenueData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-sm font-medium text-gray-900">{item.month}</div>
                <div className="flex-1 ml-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Revenue: {usdToFcfaFormatted(item.revenue)}</span>
                    <span className="text-gray-600">Orders: {item.orders}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(item.revenue / 250000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segmentation */}
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Segmentation</h3>
              <p className="text-sm text-gray-500">Customer distribution</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {customerData.map((segment, index, array) => {
                const total = array.reduce((sum, s) => sum + s.value, 0);
                const percentage = (segment.value / total) * 100;
                const rotation = array.slice(0, index).reduce((sum, s) => sum + (s.value / total) * 360, 0);
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0 rounded-full"
                    style={{
                      clipPath: `conic-gradient(${segment.color.replace('bg-', '')} 0deg ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg 360deg)`,
                      transform: `rotate(${rotation}deg)`,
                    }}
                  ></div>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{customerData.reduce((sum, s) => sum + s.value, 0)}%</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {customerData.map((segment, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${segment.color} mr-2`}></div>
                  <span className="text-sm font-medium">{segment.segment}</span>
                </div>
                <div className="text-2xl font-bold mt-1">{segment.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <p className="text-sm text-gray-500">Stock levels by category</p>
            </div>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {inventoryData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-gray-600">{item.stock} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.stock / 250) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low stock: {item.lowStock} units</span>
                  <span className={item.lowStock > 15 ? 'text-red-600' : 'text-green-600'}>
                    {item.lowStock > 15 ? '⚠️ Reorder needed' : '✓ Stock OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          <p className="text-sm text-gray-500 mt-1">Best selling products by revenue</p>
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
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{product.sales} units</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{usdToFcfaFormatted(product.revenue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;