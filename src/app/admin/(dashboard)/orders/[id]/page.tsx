'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: string;
    name: string;
    image: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  orderStatus: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: AlertCircle,
  returned: AlertCircle,
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    processing: 'bg-purple-500',
    shipped: 'bg-indigo-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
    returned: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    orderStatus: '',
    trackingNumber: '',
    courierName: '',
    adminNotes: '',
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        setUpdateData({
          orderStatus: data.order.orderStatus,
          trackingNumber: data.order.trackingNumber || '',
          courierName: data.order.courierName || '',
          adminNotes: data.order.adminNotes || '',
        });
      } else {
        toast.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Order updated successfully');
        fetchOrder();
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const timeline = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStatusIndex = timeline.findIndex(t => t.status === order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                  {timeline.map((item, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const Icon = item.icon;

                    return (
                      <div key={item.status} className="relative flex gap-4">
                        <div
                          className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                            isCompleted ? getStatusColor(item.status) : 'bg-gray-200'
                          } text-white flex-shrink-0`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h4
                            className={`font-semibold ${
                              isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {item.label}
                          </h4>
                          {item.status === order.orderStatus && (
                            <p className="text-sm text-gray-600 mt-1">
                              Updated {new Date(order.updatedAt).toLocaleString()}
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
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select
                  value={updateData.orderStatus}
                  onValueChange={(value) =>
                    setUpdateData((prev) => ({ ...prev, orderStatus: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={updateData.trackingNumber}
                  onChange={(e) =>
                    setUpdateData((prev) => ({ ...prev, trackingNumber: e.target.value }))
                  }
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="courierName">Courier Name</Label>
                <Input
                  id="courierName"
                  value={updateData.courierName}
                  onChange={(e) =>
                    setUpdateData((prev) => ({ ...prev, courierName: e.target.value }))
                  }
                  placeholder="e.g., FedEx, UPS"
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={updateData.adminNotes}
                  onChange={(e) =>
                    setUpdateData((prev) => ({ ...prev, adminNotes: e.target.value }))
                  }
                  placeholder="Internal notes"
                  rows={3}
                />
              </div>

              <Button onClick={handleUpdateOrder} disabled={updating} className="w-full">
                {updating ? 'Updating...' : 'Update Order'}
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="secondary" className="capitalize">
                  {order.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>
              {order.paymentId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="text-sm font-mono">{order.paymentId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
