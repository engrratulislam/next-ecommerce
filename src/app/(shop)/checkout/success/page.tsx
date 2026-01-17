'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Download, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Clear cart on successful order
    clearCart();
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-gray-900">#{orderDetails.orderNumber}</p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to your email address.
            </p>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${orderDetails.subtotal.toFixed(2)}</span>
                </div>
                {orderDetails.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${orderDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{orderDetails.shipping === 0 ? 'FREE' : `$${orderDetails.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${orderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-700">
                  <p>{orderDetails.shippingAddress.fullName}</p>
                  <p>{orderDetails.shippingAddress.address}</p>
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/account/orders/${orderId}`} className="col-span-1">
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                View Order
              </Button>
            </Link>
            <Button variant="outline" className="col-span-1">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Link href="/products" className="col-span-1">
              <Button className="w-full">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>We'll send you shipping updates as your order is processed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Track your order anytime from your account dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Expected delivery: 5-7 business days</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
