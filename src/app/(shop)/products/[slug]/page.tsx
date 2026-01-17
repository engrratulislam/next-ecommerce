import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/products/ProductGallery';
import ProductDetails from '@/components/products/ProductDetails';
import ProductTabs from '@/components/products/ProductTabs';
import RelatedProducts from '@/components/products/RelatedProducts';
import { Metadata } from 'next';

async function getProduct(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getReviews(productId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews/product/${productId}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return { reviews: [], stats: null };
    return await res.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], stats: null };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.seo?.metaTitle || product.name,
    description: product.seo?.metaDescription || product.shortDescription || product.description?.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.substring(0, 160),
      images: [product.thumbnail],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const { reviews, stats } = await getReviews(product._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-primary-600">Products</Link></li>
            <li>/</li>
            {product.category && (
              <>
                <li>
                  <Link href={`/categories/${product.category.slug}`} className="hover:text-primary-600">
                    {product.category.name}
                  </Link>
                </li>
                <li>/</li>
              </>
            )}
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Main Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product Details */}
            <ProductDetails product={product} />
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs product={product} reviews={reviews} stats={stats} />

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}
      </div>
    </div>
  );
}
