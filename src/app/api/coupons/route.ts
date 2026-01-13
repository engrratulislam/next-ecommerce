import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";
import { z } from "zod";

const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive(),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// POST /api/coupons - Create coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: validation.data.code });
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create coupon",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/coupons - Get all coupons (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();

    const coupons = await Coupon.find().sort("-createdAt").lean();

    return NextResponse.json(
      {
        success: true,
        coupons,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch coupons",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
