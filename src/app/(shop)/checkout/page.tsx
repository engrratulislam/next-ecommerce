'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Check, CreditCard, Truck, Package } from 'lucide-react';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [billingData, setBillingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingMethod, setShippingMethod] = useState('standard');

  const subtotal = getTotal();
  const shippingCost = shippingMethod === 'express' ? 15 : subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  useEffect(() => {
    if (!session) {
      toast.error('Please login to continue');
      router.push('/login');
    }
  }, [session, router]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant,
        })),
        shippingAddress: shippingData,
        billingAddress: sameAsShipping ? shippingData : billingData,
        paymentMethod,
        shippingMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle payment based on method
        if (paymentMethod === 'stripe' && data.paymentIntent) {
          // Redirect to Stripe payment
          router.push(`/checkout/payment?orderId=${data.order._id}&clientSecret=${data.paymentIntent.clientSecret}`);
        } else if (paymentMethod === 'paypal' && data.paypalOrderId) {
          // Redirect to PayPal
          window.location.href = data.paypalApprovalUrl;
        } else if (paymentMethod === 'cod') {
          // Cash on delivery - order placed
          clearCart();
          toast.success('Order placed successfully!');
          router.push(`/account/orders/${data.order._id}`);
        }
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className="text-sm mt-2 font-medium">{step}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingData.fullName}
                        onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingData.state}
                        onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingData.zipCode}
                        onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={shippingData.country}
                        onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="pt-4">
                    <Label className="text-base font-semibold mb-3 block">Shipping Method</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 mb-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <label htmlFor="standard" className="flex-1 cursor-pointer">
                          <div className="font-medium">Standard Shipping (5-7 days)</div>
                          <div className="text-sm text-gray-600">
                            {subtotal > 50 ? 'FREE' : '$10.00'}
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="express" id="express" />
                        <label htmlFor="express" className="flex-1 cursor-pointer">
                          <div className="font-medium">Express Shipping (2-3 days)</div>
                          <div className="text-sm text-gray-600">$15.00</div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Payment Method
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 mb-2">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <label htmlFor="stripe" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Pay securely with Stripe</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 mb-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <label htmlFor="paypal" className="flex-1 cursor-pointer">
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                      />
                      <label htmlFor="sameAsShipping" className="text-sm cursor-pointer">
                        Billing address same as shipping
                      </label>
                    </div>

                    {!sameAsShipping && (
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold">Billing Address</h3>
                        {/* Billing form fields - similar to shipping */}
                        <Input
                          placeholder="Full Name"
                          value={billingData.fullName}
                          onChange={(e) => setBillingData({ ...billingData, fullName: e.target.value })}
                          required
                        />
                        {/* Add other billing fields */}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(0)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Review Order
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Review Order
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product}-${JSON.stringify(item.variant)}`} className="flex gap-4">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-700">
                    {shippingData.fullName}<br />
                    {shippingData.address}<br />
                    {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                    {shippingData.country}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-4 mb-6">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-700 capitalize">{paymentMethod}</p>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isProcessing} className="flex-1">
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Secure checkout
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  30-day returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
