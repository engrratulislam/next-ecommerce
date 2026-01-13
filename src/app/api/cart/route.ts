import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";

// GET /api/cart - Get user cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    await connectDB();

    // Find cart by user or session
    let cart;
    if (session?.user) {
      cart = await Cart.findOne({ user: (session.user as any).id })
        .populate("items.product", "name slug price thumbnail stock")
        .lean();
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId })
        .populate("items.product", "name slug price thumbnail stock")
        .lean();
    }

    if (!cart) {
      return NextResponse.json(
        {
          success: true,
          cart: { items: [] },
          total: 0,
        },
        { status: 200 }
      );
    }

    // Calculate cart total
    const total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json(
      {
        success: true,
        cart,
        total,
        itemCount: cart.items.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cart",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
