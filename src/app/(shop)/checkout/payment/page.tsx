'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ orderId, clientSecret }: { orderId: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Secure Payment</h4>
            <p className="text-sm text-blue-800">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>By completing this payment, you agree to our</p>
        <p>
          <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>
          {' and '}
          <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const clientSecret = searchParams.get('clientSecret');

  useEffect(() => {
    if (!orderId || !clientSecret) {
      toast.error('Invalid payment session');
      router.push('/cart');
      return;
    }

    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data.order);
      } else {
        toast.error('Order not found');
        router.push('/cart');
      }
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !clientSecret || !orderDetails) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-600">
              Order #{orderDetails.orderNumber}
            </p>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm orderId={orderId} clientSecret={clientSecret} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
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
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
