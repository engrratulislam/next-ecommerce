import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";

// DELETE /api/cart/clear - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const session = await getServerSession();

    await connectDB();

    // Find and clear cart
    const userId = (session?.user as any)?.id;

    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    } else if (sessionId) {
      await Cart.findOneAndUpdate({ sessionId }, { items: [] });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cart cleared successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cart",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
