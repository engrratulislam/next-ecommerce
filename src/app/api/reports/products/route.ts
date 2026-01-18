import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// GET /api/reports/products - Get product performance report (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get top selling products
    const topSelling = await Product.find()
      .select('name slug thumbnail price salesCount stock')
      .sort('-salesCount')
      .limit(10)
      .lean();

    // Get most viewed products
    const mostViewed = await Product.find()
      .select('name slug thumbnail price viewCount')
      .sort('-viewCount')
      .limit(10)
      .lean();

    // Get top rated products
    const topRated = await Product.find({ reviewCount: { $gte: 1 } })
      .select('name slug thumbnail price rating reviewCount')
      .sort('-rating -reviewCount')
      .limit(10)
      .lean();

    // Get low stock products
    const lowStock = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
      .select('name slug thumbnail price stock lowStockThreshold')
      .sort('stock')
      .limit(10)
      .lean();

    // Get product statistics
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          averagePrice: { $avg: '$price' },
          totalSales: { $sum: '$salesCount' },
          totalViews: { $sum: '$viewCount' },
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        topSelling,
        mostViewed,
        topRated,
        lowStock,
        stats: stats[0] || {
          totalProducts: 0,
          totalStock: 0,
          averagePrice: 0,
          totalSales: 0,
          totalViews: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
