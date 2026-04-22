// Test script to verify analytics dashboard accessibility
const fs = require('fs');
const path = require('path');

console.log('📊 Testing Analytics Dashboard Accessibility\n');

// 1. Check if AnalyticsDashboard.tsx exists and is complete
console.log('1. Checking AnalyticsDashboard.tsx...');
const analyticsPath = path.join(__dirname, 'frontend/src/pages/admin/AnalyticsDashboard.tsx');
if (fs.existsSync(analyticsPath)) {
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  const lines = analyticsContent.split('\n').length;
  
  console.log(`   ✅ AnalyticsDashboard.tsx exists (${lines} lines)`);
  
  // Check for key components
  const requiredComponents = [
    'KPI Cards',
    'Sales Trend Chart',
    'Revenue by Month Chart',
    'Customer Segmentation Pie Chart',
    'Inventory Status',
    'Top Products Table',
    'Time Range Selector',
    'Export Functionality'
  ];
  
  const componentChecks = [
    { name: 'KPI Cards', check: analyticsContent.includes('kpiCards') },
    { name: 'Sales Trend Chart', check: analyticsContent.includes('salesData') },
    { name: 'Revenue by Month Chart', check: analyticsContent.includes('revenueData') },
    { name: 'Customer Segmentation Pie Chart', check: analyticsContent.includes('customerData') },
    { name: 'Inventory Status', check: analyticsContent.includes('inventoryData') },
    { name: 'Top Products Table', check: analyticsContent.includes('topProducts') },
    { name: 'Time Range Selector', check: analyticsContent.includes('timeRange') },
    { name: 'Export Functionality', check: analyticsContent.includes('exportData') }
  ];
  
  let componentsFound = 0;
  componentChecks.forEach(({ name, check }) => {
    if (check) {
      console.log(`   ✅ ${name} component found`);
      componentsFound++;
    } else {
      console.log(`   ❌ ${name} component missing`);
    }
  });
  
  console.log(`   📈 ${componentsFound}/${requiredComponents.length} analytics components implemented`);
} else {
  console.log('   ❌ AnalyticsDashboard.tsx not found');
}

// 2. Check if App.tsx has the analytics route
console.log('\n2. Checking App.tsx routing for analytics...');
const appPath = path.join(__dirname, 'frontend/src/App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('AnalyticsDashboard')) {
    console.log('   ✅ AnalyticsDashboard import found');
  } else {
    console.log('   ❌ AnalyticsDashboard import missing');
  }
  
  if (appContent.includes('/admin/analytics')) {
    console.log('   ✅ /admin/analytics route configured');
  } else {
    console.log('   ❌ /admin/analytics route missing');
  }
} else {
  console.log('   ❌ App.tsx not found');
}

// 3. Check if AdminLayout.tsx has analytics navigation
console.log('\n3. Checking AdminLayout.tsx navigation...');
const adminLayoutPath = path.join(__dirname, 'frontend/src/pages/admin/AdminLayout.tsx');
if (fs.existsSync(adminLayoutPath)) {
  const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
  
  if (adminLayoutContent.includes('/admin/analytics')) {
    console.log('   ✅ Analytics navigation link found');
  } else {
    console.log('   ❌ Analytics navigation link missing');
  }
  
  if (adminLayoutContent.includes('Analytics') || adminLayoutContent.includes('analytics')) {
    console.log('   ✅ Analytics menu item text found');
  } else {
    console.log('   ❌ Analytics menu item text missing');
  }
} else {
  console.log('   ❌ AdminLayout.tsx not found');
}

// 4. Check if the dashboard has mock data for development
console.log('\n4. Checking mock data configuration...');
const orderStorePath = path.join(__dirname, 'frontend/src/store/orderStore.ts');
if (fs.existsSync(orderStorePath)) {
  const orderStoreContent = fs.readFileSync(orderStorePath, 'utf8');
  
  if (orderStoreContent.includes('mockOrderService')) {
    console.log('   ✅ Mock order service configured for development');
  } else {
    console.log('   ❌ Mock order service not configured');
  }
} else {
  console.log('   ❌ orderStore.ts not found');
}

// 5. Check backend authentication bypass
console.log('\n5. Checking backend authentication bypass...');
const authPath = path.join(__dirname, 'backend/src/middleware/auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  if (authContent.includes('process.env.NODE_ENV === \'development\'')) {
    console.log('   ✅ Development authentication bypass configured');
  } else {
    console.log('   ❌ Development authentication bypass missing');
  }
} else {
  console.log('   ❌ auth.ts not found');
}

console.log('\n🎯 Testing Instructions:');
console.log('   1. Open browser to http://localhost:5173/admin/analytics');
console.log('   2. Verify the analytics dashboard loads without errors');
console.log('   3. Check that all 8 analytics components are displayed');
console.log('   4. Test the time range selector functionality');
console.log('   5. Test the export functionality');
console.log('   6. Verify charts render correctly with mock data');
console.log('\n📋 Expected Results:');
console.log('   • Dashboard should load within 2-3 seconds');
console.log('   • No authentication errors should appear');
console.log('   • All charts should display with mock data');
console.log('   • KPI cards should show realistic numbers');
console.log('   • Export button should trigger download');
console.log('\n✅ Success Criteria:');
console.log('   The analytics dashboard is fully functional with mock data');
console.log('   All components render correctly without TypeScript errors');
console.log('   The dashboard is accessible via /admin/analytics route');
console.log('   No backend API calls fail due to authentication');