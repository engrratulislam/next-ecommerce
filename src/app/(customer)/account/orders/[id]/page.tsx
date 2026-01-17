'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Download,
  MapPin,
  CreditCard,
  Calendar
} from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  name: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  orderStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        toast.error('Order not found');
        router.push('/account/orders');
      }
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${params.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation' }),
      });

      if (response.ok) {
        toast.success('Order cancelled successfully');
        fetchOrderDetails();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsCancelling(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Package className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
      case 'returned':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const orderTimeline = [
    { status: 'pending', label: 'Order Placed', completed: true },
    { status: 'confirmed', label: 'Confirmed', completed: order && ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) },
    { status: 'processing', label: 'Processing', completed: order && ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
    { status: 'shipped', label: 'Shipped', completed: order && ['shipped', 'delivered'].includes(order.orderStatus) },
    { status: 'delivered', label: 'Delivered', completed: order?.orderStatus === 'delivered' },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/account/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(order.orderStatus)}>
            {order.orderStatus}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Order Timeline */}
      {order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ 
                  width: `${(orderTimeline.filter(s => s.completed).length - 1) / (orderTimeline.length - 1) * 100}%` 
                }}
              />
            </div>
            <div className="relative flex justify-between">
              {orderTimeline.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 text-center font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Tracking Information</h4>
              <p className="text-sm text-blue-800 mb-2">
                Courier: <span className="font-medium">{order.courierName || 'Standard Shipping'}</span>
              </p>
              <p className="text-sm text-blue-800 mb-2">
                Tracking Number: <span className="font-mono font-medium">{order.trackingNumber}</span>
              </p>
              {order.estimatedDelivery && (
                <p className="text-sm text-blue-800">
                  Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
              {order.trackingUrl && (
                <a 
                  href={order.trackingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline mt-2 inline-block"
                >
                  Track Package →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link 
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h3>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="mt-1">{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Badge className={order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-sm">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.orderStatus === 'pending' && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              )}
              <Button variant="outline" className="w-full">
                Need Help?
              </Button>
            </div>

            {order.notes && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
