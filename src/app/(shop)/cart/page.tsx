'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getTotal();
  const discount = appliedCoupon ? (appliedCoupon.discountType === 'percentage' 
    ? (subtotal * appliedCoupon.discountValue) / 100 
    : appliedCoupon.discountValue) : 0;
  const tax = (subtotal - discount) * 0.1; // 10% tax
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal - discount + tax + shipping;

  const handleQuantityChange = (productId: string, currentQuantity: number, delta: number, variant?: any) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity, variant);
    }
  };

  const handleRemoveItem = (productId: string, variant?: any) => {
    removeItem(productId, variant);
    toast.success('Item removed from cart');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        toast.success('Coupon applied successfully!');
      } else {
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link href="/products">
            <Button size="lg">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><a href="/" className="hover:text-primary-600">Home</a></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Shopping Cart</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product}-${JSON.stringify(item.variant)}`}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-lg font-bold text-primary-600">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => handleRemoveItem(item.product, item.variant)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.product, item.quantity, -1, item.variant)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product, item.quantity, 1, item.variant)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" onClick={handleRemoveCoupon}>
                      Remove
                    </Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Coupon "{appliedCoupon.code}" applied
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal < 50 && (
                  <p className="text-sm text-gray-600">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button size="lg" className="w-full mb-4">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-2xl">🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-2xl">🚚</span>
                  <span>Free shipping over $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-2xl">↩️</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
