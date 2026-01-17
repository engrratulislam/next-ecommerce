'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Share2, Minus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnail?: string;
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  shortDescription?: string;
  description: string;
  category?: {
    name: string;
    slug: string;
  };
  variants?: Array<{
    name: string;
    options: Array<{
      value: string;
      price?: number;
      stock?: number;
    }>;
  }>;
  tags?: string[];
}

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Check if all variants are selected
    if (product.variants && product.variants.length > 0) {
      const allSelected = product.variants.every((variant) => selectedVariants[variant.name]);
      if (!allSelected) {
        toast.error('Please select all product options');
        return;
      }
    }

    setIsAddingToCart(true);

    try {
      addItem({
        product: product._id,
        name: product.name,
        image: product.thumbnail || '/placeholder.png',
        price: product.price,
        quantity,
        variant: Object.keys(selectedVariants).length > 0
          ? { name: Object.keys(selectedVariants)[0], value: Object.values(selectedVariants)[0] }
          : undefined,
      });

      toast.success('Added to cart!');
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        {product.category && (
          <p className="text-sm text-gray-600">
            Category: <Link href={`/categories/${product.category.slug}`} className="text-primary-600 hover:underline">{product.category.name}</Link>
          </p>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4">
        {renderStars(product.rating)}
        <span className="text-sm text-gray-600">
          {product.rating.toFixed(1)} ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-4">
        <span className="text-4xl font-bold text-gray-900">
          ${product.price.toFixed(2)}
        </span>
        {product.comparePrice && (
          <>
            <span className="text-2xl text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
            <Badge variant="destructive" className="text-base">
              Save {discountPercentage}%
            </Badge>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <p className="text-gray-700 leading-relaxed">{product.shortDescription}</p>
      )}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {product.stock > 0 ? (
          <>
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">
              In Stock ({product.stock} available)
            </span>
          </>
        ) : (
          <span className="text-red-600 font-medium">Out of Stock</span>
        )}
      </div>

      {/* SKU */}
      <div className="text-sm text-gray-600">
        SKU: <span className="font-medium">{product.sku}</span>
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-4">
          {product.variants.map((variant) => (
            <div key={variant.name}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {variant.name}
              </label>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleVariantChange(variant.name, option.value)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                      selectedVariants[variant.name] === option.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 font-medium min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-gray-600">
            {product.stock} available
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAddingToCart}
          size="lg"
          className="flex-1"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => toast.success('Added to wishlist!')}
        >
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="lg" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
