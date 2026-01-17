'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?featured=true&limit=8'),
        fetch('/api/categories'),
      ]);

      const [productsData, categoriesData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
      ]);

      setFeaturedProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Successfully subscribed to our newsletter!');
        setNewsletterEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to MyStore
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Discover amazing products at unbeatable prices. Shop now and enjoy free shipping on orders over $50!
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-600">
                Browse our wide selection of products
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category: any) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Check out our handpicked selection
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                On orders over $50
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                100% secure transactions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">↩️</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-600">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new products and upcoming sales
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <Button type="submit" variant="secondary" size="lg" disabled={subscribing}>
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
