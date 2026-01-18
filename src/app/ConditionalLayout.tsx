'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // For admin routes, render children without Header/Footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For non-admin routes, render with Header/Footer
  return (
    <>
      <Header />
      <MobileNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
