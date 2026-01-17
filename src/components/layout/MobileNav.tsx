'use client';

import { X, Home, ShoppingBag, User, LogIn, Package } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';

export default function MobileNav() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { data: session } = useSession();

  if (!isMobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={toggleMobileMenu}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 shadow-xl md:hidden transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                href="/products"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Products</span>
              </Link>

              <Link
                href="/categories"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Categories</span>
              </Link>

              {session ? (
                <>
                  <div className="border-t my-4" />
                  <Link
                    href="/account/profile"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">My Account</span>
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">My Orders</span>
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      toggleMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <LogIn className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t my-4" />
                  <Link
                    href="/login"
                    onClick={toggleMobileMenu}
                  >
                    <Button className="w-full" size="lg">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={toggleMobileMenu}
                  >
                    <Button variant="outline" className="w-full mt-2" size="lg">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600 text-center">
              © 2026 MyStore. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
