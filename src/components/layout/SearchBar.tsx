'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        const data = await response.json();
        setResults(data.products || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleResultClick(product.slug)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={product.thumbnail || '/placeholder.png'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-primary-600 font-semibold">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
              <div className="border-t px-4 py-2">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all results for "{query}"
                </button>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
