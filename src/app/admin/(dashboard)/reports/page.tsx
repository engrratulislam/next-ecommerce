'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  Star,
  Eye,
  AlertCircle,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SalesReport {
  period: string;
  summary: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
  };
  revenueByStatus: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  salesTrend: Array<{
    _id: string;
    orders: number;
    revenue: number;
  }>;
}

interface ProductReport {
  topSelling: Array<any>;
  mostViewed: Array<any>;
  topRated: Array<any>;
  lowStock: Array<any>;
  stats: {
    totalProducts: number;
    totalStock: number;
    averagePrice: number;
    totalSales: number;
    totalViews: number;
  };
}

interface CustomerReport {
  topCustomers: Array<any>;
  stats: {
    totalCustomers: number;
    newCustomers: number;
  };
  customerGrowth: Array<{
    _id: string;
    count: number;
  }>;
}

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [productReport, setProductReport] = useState<ProductReport | null>(null);
  const [customerReport, setCustomerReport] = useState<CustomerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, productRes, customerRes] = await Promise.all([
        fetch(`/api/reports/sales?period=${period}`),
        fetch('/api/reports/products'),
        fetch('/api/reports/customers'),
      ]);

      const [salesData, productData, customerData] = await Promise.all([
        salesRes.json(),
        productRes.json(),
        customerRes.json(),
      ]);

      if (salesData.success) setSalesReport(salesData);
      if (productData.success) setProductReport(productData);
      if (customerData.success) setCustomerReport(customerData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(salesReport?.summary.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {salesReport?.summary.orderCount || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(salesReport?.summary.averageOrderValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {customerReport?.stats.totalCustomers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesReport?.revenueByStatus.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={getStatusColor(item._id)}>
                          {item._id}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {item.count} orders
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {salesReport?.salesTrend.slice(-7).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600">{item._id}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-900">
                          {item.orders} orders
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product Performance Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productReport?.topSelling.slice(0, 5).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {product.salesCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">{product.stock}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Most Viewed Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Most Viewed Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productReport?.mostViewed.slice(0, 5).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {product.viewCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {formatCurrency(product.price)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Rated Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Rated Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Reviews</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productReport?.topRated.slice(0, 5).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {product.reviewCount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productReport?.lowStock.slice(0, 5).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <Link
                              href={`/admin/products/edit/${product._id}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{product.stock}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {product.lowStockThreshold}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {productReport?.stats.totalProducts || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {productReport?.stats.totalStock || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(productReport?.stats.averagePrice || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {productReport?.stats.totalSales || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {productReport?.stats.totalViews || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerReport?.topCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name}
                            </p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {customer.orderCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Customer Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customerReport?.customerGrowth.slice(-10).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600">{item._id}</span>
                      <Badge variant="secondary">{item.count} new</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Customers
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {customerReport?.stats.totalCustomers || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      New Customers (30 days)
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {customerReport?.stats.newCustomers || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
