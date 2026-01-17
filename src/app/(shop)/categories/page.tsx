'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load categories');
        return;
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 h-48"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Categories</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
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
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Categories</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our wide selection of products organized by category
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories available</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category._id}>
                {/* Main Category */}
                <Link
                  href={`/categories/${category.slug}`}
                  className="group block mb-6"
                >
                  <div className="bg-white rounded-lg p-8 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {category.image ? (
                          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {category.name}
                          </h2>
                          {category.description && (
                            <p className="text-gray-600 mt-1">{category.description}</p>
                          )}
                          {category.productCount !== undefined && (
                            <p className="text-sm text-gray-500 mt-2">
                              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                            </p>
                          )}
                        </div>
                      </div>
                      <svg
                        className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Subcategories */}
                {category.children && category.children.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ml-8">
                    {category.children.map((subcat) => (
                      <Link
                        key={subcat._id}
                        href={`/categories/${subcat.slug}`}
                        className="group"
                      >
                        <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                          {subcat.image ? (
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              <img
                                src={subcat.image}
                                alt={subcat.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-2xl">📁</span>
                            </div>
                          )}
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {subcat.name}
                          </h3>
                          {subcat.productCount !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {subcat.productCount} items
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Link href="/products">
            <Button size="lg">Browse All Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
