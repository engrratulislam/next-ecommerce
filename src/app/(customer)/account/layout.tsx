'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    { href: '/account/profile', icon: User, label: 'Profile' },
    { href: '/account/orders', icon: Package, label: 'Orders' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><a href="/" className="hover:text-primary-600">Home</a></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">My Account</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Welcome back, {session.user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-primary-600"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
