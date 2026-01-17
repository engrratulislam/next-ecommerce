'use client';

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
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

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.success('Added to wishlist!');
          }}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.thumbnail || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[40px]">
            {product.name}
          </h3>

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
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
