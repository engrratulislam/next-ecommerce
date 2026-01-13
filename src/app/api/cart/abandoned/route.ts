import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";

// GET /api/cart/abandoned - Get abandoned carts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    // Find carts that haven't been updated in specified days
    const abandonedDate = new Date();
    abandonedDate.setDate(abandonedDate.getDate() - days);

    const [carts, totalCount] = await Promise.all([
      Cart.find({
        updatedAt: { $lt: abandonedDate },
        items: { $exists: true, $ne: [] },
      })
        .populate("user", "name email")
        .populate("items.product", "name price thumbnail")
        .sort("-updatedAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Cart.countDocuments({
        updatedAt: { $lt: abandonedDate },
        items: { $exists: true, $ne: [] },
      }),
    ]);

    // Calculate cart totals
    const cartsWithTotals = carts.map((cart: any) => ({
      ...cart,
      total: cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      ),
      itemCount: cart.items.length,
    }));

    return NextResponse.json(
      {
        success: true,
        carts: cartsWithTotals,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get abandoned carts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch abandoned carts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
