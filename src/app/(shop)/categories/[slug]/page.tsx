'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimplePagination } from '@/components/ui/simple-pagination';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [slug, searchParams]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await fetch(`/api/categories/${slug}?${params}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to load category');
        return;
      }

      setCategory(data.category || null);
      setSubcategories(data.subcategories || []);
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category');
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
    params.set('page', '1');
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams('sort', value);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
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
            <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
            {category && (
              <>
                <li>/</li>
                <li className="text-gray-900 font-medium">{category.name}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Category Header */}
        {category && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 max-w-3xl">{category.description}</p>
            )}
            <p className="text-gray-600 mt-2">
              {pagination ? `${pagination.totalCount} products found` : 'Loading...'}
            </p>
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat._id}
                  href={`/categories/${subcat.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    {subcat.image && (
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={subcat.image}
                          alt={subcat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {subcat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
                      Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
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
            <ProductGrid 
              products={products} 
              isLoading={loading}
              emptyMessage={`No products found in ${category?.name || 'this category'}`}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <SimplePagination
                  currentPage={pagination.page}
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
