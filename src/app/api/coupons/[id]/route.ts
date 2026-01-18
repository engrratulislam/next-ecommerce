import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { z } from 'zod';

const updateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().optional(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  usagePerCustomer: z.number().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/coupons/[id] - Get single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectDB();

    const coupon = await Coupon.findById(id).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        coupon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get coupon error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch coupon',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validation = updateCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if code is being changed and if it already exists
    if (validation.data.code && validation.data.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: validation.data.code,
        _id: { $ne: id },
      });
      if (existingCoupon) {
        return NextResponse.json(
          { success: false, error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    // Update fields
    Object.assign(coupon, validation.data);
    await coupon.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon updated successfully',
        coupon,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update coupon',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    await connectDB();

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await coupon.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: 'Coupon deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete coupon',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
