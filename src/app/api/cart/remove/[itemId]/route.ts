import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";

// DELETE /api/cart/remove/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const session = await getServerSession();

    await connectDB();

    // Find cart
    let cart;
    const userId = (session?.user as any)?.id;

    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    // Remove item from cart
    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate("items.product", "name slug price thumbnail stock");

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from cart",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove item from cart",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
