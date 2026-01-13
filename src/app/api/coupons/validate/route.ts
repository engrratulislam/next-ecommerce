import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (!coupon.isValid()) {
      return NextResponse.json(
        { success: false, error: "Coupon has expired or is not active" },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    const canUse = await coupon.canBeUsedBy(userId, 0);

    if (!canUse) {
      return NextResponse.json(
        { success: false, error: "You have reached the usage limit for this coupon" },
        { status: 400 }
      );
    }

    const discount = coupon.calculateDiscount(subtotal);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon is valid",
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate coupon",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
