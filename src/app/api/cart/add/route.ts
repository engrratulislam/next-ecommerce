import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  variant: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .optional(),
  sessionId: z.string().optional(),
});

// POST /api/cart/add - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);

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

    const { productId, quantity, variant, sessionId } = validation.data;
    const session = await getServerSession();

    await connectDB();

    // Check if product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product is not available" },
        { status: 400 }
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

    // Find or create cart
    let cart;
    const userId = (session?.user as any)?.id;

    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        sessionId: !userId ? sessionId : undefined,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) =>
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot add more. Only ${product.stock} available`,
          },
          { status: 400 }
        );
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        variant,
      });
    }

    await cart.save();

    // Populate cart for response
    await cart.populate("items.product", "name slug price thumbnail stock");

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add item to cart",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
