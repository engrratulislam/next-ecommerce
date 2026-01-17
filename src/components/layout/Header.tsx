'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import SearchBar from './SearchBar';

export default function Header() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const { toggleMobileMenu, toggleCart } = useUIStore();
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-600" />
              <span className="text-xl font-bold text-gray-900">MyStore</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Categories
              </Link>
              <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search Icon - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-xs text-white flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* User Account */}
            {session ? (
              <Link href="/account/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
