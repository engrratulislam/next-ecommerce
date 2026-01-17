'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  revenue: {
    total: number;
    change: number;
  };
  orders: {
    total: number;
    pending: number;
    change: number;
  };
  customers: {
    total: number;
    change: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent orders
      const ordersRes = await fetch('/api/orders?limit=5&sort=-createdAt');
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setRecentOrders(ordersData.orders || []);
      }

      // Fetch low stock products
      const lowStockRes = await fetch('/api/inventory/low-stock?limit=5');
      const lowStockData = await lowStockRes.json();
      if (lowStockData.success) {
        setLowStockProducts(lowStockData.products || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      delivered: 'default',
      shipped: 'default',
      processing: 'secondary',
      pending: 'secondary',
      cancelled: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  ${stats?.revenue.total.toLocaleString() || 0}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  {(stats?.revenue.change || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      (stats?.revenue.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(stats?.revenue.change || 0)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.orders.total.toLocaleString() || 0}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{stats?.orders.pending || 0} pending</Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.customers.total.toLocaleString() || 0}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  {(stats?.customers.change || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      (stats?.customers.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {Math.abs(stats?.customers.change || 0)}%
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.products.total.toLocaleString() || 0}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {(stats?.products.lowStock || 0) > 0 && (
                    <Badge variant="destructive">
                      {stats?.products.lowStock} low stock
                    </Badge>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All
                  <Eye className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant="ghost" size="sm" className="mt-1">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Low Stock Alert
              </CardTitle>
              <Link href="/admin/inventory">
                <Button variant="ghost" size="sm">
                  View All
                  <Eye className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">All products in stock</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((product.stock / product.lowStockThreshold) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-orange-600">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/products/${product._id}/edit`}>
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>Add Product</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>View Orders</span>
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Customers</span>
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
