import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';

// PUT /api/admin/reviews/[id] - Update review (approve/reject, add reply)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (typeof body.isApproved !== 'undefined') {
      review.isApproved = body.isApproved;
    }

    if (body.adminReply) {
      review.adminReply = {
        message: body.adminReply,
        repliedAt: new Date(),
      };
    }

    await review.save();

    // Update product rating if approval status changed
    if (typeof body.isApproved !== 'undefined') {
      const product = await Product.findById(review.product);
      if (product) {
        await product.updateRating();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review updated successfully',
        review,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    const product = await Product.findById(productId);
    if (product) {
      await product.updateRating();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
