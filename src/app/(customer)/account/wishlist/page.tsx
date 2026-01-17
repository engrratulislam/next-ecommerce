'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface WishlistProduct {
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

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Removed from wishlist');
        setProducts(products.filter(p => p._id !== productId));
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleAddToCart = (product: WishlistProduct) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem({
      product: product._id,
      name: product.name,
      image: product.thumbnail,
      price: product.price,
      quantity: 1,
    });

    toast.success('Added to cart!');
  };

  const handleAddAllToCart = () => {
    const inStockProducts = products.filter(p => p.stock > 0);
    
    if (inStockProducts.length === 0) {
      toast.error('No products in stock');
      return;
    }

    inStockProducts.forEach(product => {
      addItem({
        product: product._id,
        name: product.name,
        image: product.thumbnail,
        price: product.price,
        quantity: 1,
      });
    });

    toast.success(`Added ${inStockProducts.length} items to cart!`);
  };

  const handleShareWishlist = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-gray-600">{products.length} items</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShareWishlist}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleAddAllToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Cart
          </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const discountPercentage = product.comparePrice
            ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
            : 0;

          return (
            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.thumbnail || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.isFeatured && (
                      <Badge className="bg-primary-600">Featured</Badge>
                    )}
                    {discountPercentage > 0 && (
                      <Badge variant="destructive">-{discountPercentage}%</Badge>
                    )}
                    {product.stock <= 0 && (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveFromWishlist(product._id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[40px] hover:text-primary-600">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="w-full"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
