'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <p className="text-gray-600">{orders.length} orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4 mb-4">
              <div className="space-y-2">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-600">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href={`/account/orders/${order._id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              {order.orderStatus === 'pending' && (
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
