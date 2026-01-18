import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

// GET /api/admin/reviews - Get all reviews for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || '';
    const ratingFilter = searchParams.get('rating') || '';

    await connectDB();

    // Build query
    const query: any = {};

    if (statusFilter === 'approved') {
      query.isApproved = true;
    } else if (statusFilter === 'pending') {
      query.isApproved = false;
    }

    if (ratingFilter) {
      query.rating = parseInt(ratingFilter);
    }

    // Get reviews with populated fields
    const [reviews, totalCount] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name slug thumbnail')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    // Filter by search if provided
    let filteredReviews = reviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = reviews.filter((review: any) => {
        return (
          review.user?.name?.toLowerCase().includes(searchLower) ||
          review.user?.email?.toLowerCase().includes(searchLower) ||
          review.product?.name?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower)
        );
      });
    }

    return NextResponse.json(
      {
        success: true,
        reviews: filteredReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
