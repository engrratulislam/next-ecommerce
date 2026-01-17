'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Search, CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import Link from 'next/link';

interface OrderStatus {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: string;
  message: string;
}

interface TrackingInfo {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  timeline: OrderStatus[];
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5" />;
    case 'confirmed':
    case 'processing':
      return <Package className="h-5 w-5" />;
    case 'shipped':
      return <Truck className="h-5 w-5" />;
    case 'delivered':
      return <CheckCircle2 className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500';
    case 'confirmed':
      return 'bg-blue-500';
    case 'processing':
      return 'bg-purple-500';
    case 'shipped':
      return 'bg-indigo-500';
    case 'delivered':
      return 'bg-green-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTrackingInfo(null);

    try {
      const response = await fetch(`/api/orders/track?orderNumber=${orderNumber}&email=${email}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Order not found. Please check your order number and email.');
        return;
      }

      setTrackingInfo(data.order);
    } catch (err) {
      setError('Failed to track order. Please try again.');
      console.error('Track order error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number and email to track your shipment
          </p>
        </div>

        {/* Search Form */}
        {!trackingInfo && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>
                You can find your order number in your confirmation email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    placeholder="ORD-2026-0001"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Tracking...' : 'Track Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Order {trackingInfo.orderNumber}
                    </h2>
                    <p className="text-gray-600">
                      Placed on {new Date(trackingInfo.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(trackingInfo.status)} className="capitalize">
                    {trackingInfo.status}
                  </Badge>
                </div>

                {/* Tracking Number */}
                {trackingInfo.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                        <p className="font-semibold text-gray-900">{trackingInfo.trackingNumber}</p>
                        {trackingInfo.courierName && (
                          <p className="text-sm text-gray-600 mt-1">via {trackingInfo.courierName}</p>
                        )}
                      </div>
                      {trackingInfo.estimatedDelivery && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200" />

                  {/* Timeline Items */}
                  <div className="space-y-8">
                    {trackingInfo.timeline.map((item, index) => {
                      const isCompleted = index <= trackingInfo.timeline.findIndex(
                        t => t.status === trackingInfo.status
                      );
                      
                      return (
                        <div key={index} className="relative flex gap-4">
                          {/* Icon */}
                          <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                            isCompleted ? getStatusColor(item.status) : 'bg-gray-200'
                          } text-white flex-shrink-0`}>
                            {getStatusIcon(item.status)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pt-1">
                            <h4 className={`font-semibold capitalize ${
                              isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {item.status}
                            </h4>
                            <p className={`text-sm ${
                              isCompleted ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {item.message}
                            </p>
                            {item.timestamp && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(item.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingInfo.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        ${trackingInfo.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Home className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{trackingInfo.shippingAddress.name}</p>
                    <p className="text-gray-600">{trackingInfo.shippingAddress.street}</p>
                    <p className="text-gray-600">
                      {trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.state} {trackingInfo.shippingAddress.zipCode}
                    </p>
                    <p className="text-gray-600">{trackingInfo.shippingAddress.country}</p>
                    <p className="text-gray-600 mt-2">{trackingInfo.shippingAddress.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setTrackingInfo(null);
                  setOrderNumber('');
                  setEmail('');
                }}
                className="flex-1"
              >
                Track Another Order
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
