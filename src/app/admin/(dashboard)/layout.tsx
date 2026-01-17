'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Star,
  Tag,
  Megaphone,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Store,
  FileText,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Products',
    icon: Package,
    children: [
      { name: 'All Products', href: '/admin/products' },
      { name: 'Add New', href: '/admin/products/new' },
      { name: 'Categories', href: '/admin/categories' },
    ],
  },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  {
    name: 'Marketing',
    icon: Megaphone,
    children: [
      { name: 'Email Campaigns', href: '/admin/marketing/campaigns' },
      { name: 'Abandoned Carts', href: '/admin/marketing/abandoned-carts' },
    ],
  },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/admin/settings/general' },
      { name: 'Payment', href: '/admin/settings/payment' },
      { name: 'Shipping', href: '/admin/settings/shipping' },
      { name: 'Email', href: '/admin/settings/email' },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Redirect if not authenticated or not admin
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    router.push('/admin/login');
    return null;
  }

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-xl text-gray-900">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              const isExpanded = expandedItems.includes(item.name);
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(child.href)
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Store className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title - hidden on mobile */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {pathname === '/admin' && 'Dashboard'}
                {pathname.includes('/products') && 'Products'}
                {pathname.includes('/orders') && 'Orders'}
                {pathname.includes('/customers') && 'Customers'}
                {pathname.includes('/inventory') && 'Inventory'}
                {pathname.includes('/reviews') && 'Reviews'}
                {pathname.includes('/coupons') && 'Coupons'}
                {pathname.includes('/marketing') && 'Marketing'}
                {pathname.includes('/reports') && 'Reports'}
                {pathname.includes('/pages') && 'Pages'}
                {pathname.includes('/settings') && 'Settings'}
              </h1>
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-600 text-white text-sm">
                      {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Admin Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
