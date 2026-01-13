import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";

const updateCartSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  sessionId: z.string().optional(),
});

// PUT /api/cart/update - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = updateCartSchema.safeParse(body);

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

    const { itemId, quantity, sessionId } = validation.data;
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

    // Find item in cart
    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart" },
        { status: 404 }
      );
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient stock. Only ${product.stock} available`,
        },
        { status: 400 }
      );
    }

    // Update quantity
    item.quantity = quantity;
    await cart.save();

    await cart.populate("items.product", "name slug price thumbnail stock");

    return NextResponse.json(
      {
        success: true,
        message: "Cart updated successfully",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cart",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
