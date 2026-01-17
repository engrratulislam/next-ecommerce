'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export default function ProductFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchCategories();
    loadFiltersFromURL();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadFiltersFromURL = () => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategories(category.split(','));
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000,
      ]);
    }

    const rating = searchParams.get('rating');
    if (rating) {
      setSelectedRating(parseInt(rating));
    }

    const inStock = searchParams.get('inStock');
    if (inStock === 'true') {
      setInStockOnly(true);
    }
  };

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    let newCategories: string[];
    if (checked) {
      newCategories = [...selectedCategories, categorySlug];
    } else {
      newCategories = selectedCategories.filter((c) => c !== categorySlug);
    }
    setSelectedCategories(newCategories);
    updateFilters({ category: newCategories.length > 0 ? newCategories.join(',') : null });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    updateFilters({ rating: newRating ? newRating.toString() : null });
  };

  const handleInStockChange = (checked: boolean) => {
    setInStockOnly(checked);
    updateFilters({ inStock: checked ? 'true' : null });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSelectedRating(null);
    setInStockOnly(false);
    router.push('/products');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedRating !== null || inStockOnly || 
    searchParams.get('minPrice') || searchParams.get('maxPrice');

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Active Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => {
              const category = categories.find((c) => c.slug === cat);
              return (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {category?.name}
                  <button onClick={() => handleCategoryChange(cat, false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {selectedRating && (
              <Badge variant="secondary" className="gap-1">
                {selectedRating}★ & up
                <button onClick={() => handleRatingChange(selectedRating)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {inStockOnly && (
              <Badge variant="secondary" className="gap-1">
                In Stock
                <button onClick={() => handleInStockChange(false)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.slice(0, 10).map((category) => (
            <div key={category._id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category._id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.slug, checked as boolean)
                }
              />
              <label
                htmlFor={`category-${category._id}`}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {category.name}
                {category.productCount !== undefined && (
                  <span className="text-gray-400 ml-1">({category.productCount})</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <Button onClick={applyPriceFilter} size="sm" className="w-full">
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedRating === rating
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
          />
          <label htmlFor="in-stock" className="text-sm text-gray-700 cursor-pointer">
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  );
}
