'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductTabsProps {
  product: any;
  reviews: Review[];
  stats: ReviewStats | null;
}

export default function ProductTabs({ product, reviews, stats }: ProductTabsProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Specifications
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-600 data-[state=active]:bg-transparent"
          >
            Shipping & Returns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div className="space-y-4">
            <table className="w-full">
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900 w-1/3">SKU</td>
                  <td className="py-3 text-sm text-gray-700">{product.sku}</td>
                </tr>
                {product.barcode && (
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-900">Barcode</td>
                    <td className="py-3 text-sm text-gray-700">{product.barcode}</td>
                  </tr>
                )}
                {product.weight && (
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-900">Weight</td>
                    <td className="py-3 text-sm text-gray-700">{product.weight}g</td>
                  </tr>
                )}
                {product.dimensions && (
                  <tr>
                    <td className="py-3 text-sm font-medium text-gray-900">Dimensions</td>
                    <td className="py-3 text-sm text-gray-700">
                      {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-900">Product Type</td>
                  <td className="py-3 text-sm text-gray-700 capitalize">{product.productType || 'Physical'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            {/* Rating Summary */}
            {stats && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    {renderStars(Math.round(stats.averageRating))}
                    <p className="text-sm text-gray-600 mt-2">
                      Based on {stats.totalReviews} reviews
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-8">{rating}★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{review.user.name}</span>
                          {review.isVerified && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                        )}
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Free shipping on orders over $50</li>
                <li>Standard shipping: 5-7 business days</li>
                <li>Express shipping: 2-3 business days</li>
                <li>International shipping available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Return Policy</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>30-day return policy</li>
                <li>Items must be unused and in original packaging</li>
                <li>Free returns on defective items</li>
                <li>Refund processed within 5-7 business days</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Warranty</h3>
              <p className="text-gray-700">
                All products come with a 1-year manufacturer warranty covering defects in materials and workmanship.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
