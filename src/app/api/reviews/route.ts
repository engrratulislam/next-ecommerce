import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { z } from "zod";

const createReviewSchema = z.object({
  product: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(10).max(1000),
});

// POST /api/reviews - Create review
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
    const validation = createReviewSchema.safeParse(body);

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

    const { product, rating, title, comment } = validation.data;
    const userId = (session.user as any).id;

    await connectDB();

    // Check if user has purchased this product
    const hasPurchased = await Order.exists({
      user: userId,
      "items.product": product,
      orderStatus: "delivered",
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only review products you have purchased",
        },
        { status: 403 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product });
    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this product",
        },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product,
      rating,
      title,
      comment,
      isVerified: true,
    });

    // Update product rating
    const productDoc = await Product.findById(product);
    if (productDoc) {
      await productDoc.updateRating();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create review",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
