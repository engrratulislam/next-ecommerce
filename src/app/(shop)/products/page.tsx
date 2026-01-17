'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimplePagination } from '@/components/ui/simple-pagination';
import { SlidersHorizontal } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured?: boolean;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams('sort', value);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><a href="/" className="hover:text-primary-600">Home</a></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Products</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">
            {pagination ? `${pagination.totalCount} products found` : 'Loading...'}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilter />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                {/* Results Count */}
                <div className="hidden sm:block text-sm text-gray-600">
                  {pagination && (
                    <span>
                      Showing {((pagination.currentPage - 1) * 12) + 1} - {Math.min(pagination.currentPage * 12, pagination.totalCount)} of {pagination.totalCount}
                    </span>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
                  <Select
                    value={searchParams.get('sort') || '-createdAt'}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-createdAt">Newest First</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="-price">Price: High to Low</SelectItem>
                      <SelectItem value="-rating">Best Rating</SelectItem>
                      <SelectItem value="-salesCount">Most Popular</SelectItem>
                      <SelectItem value="name">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-lg shadow-sm p-4">
                <ProductFilter />
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid products={products} isLoading={loading} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <SimplePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
