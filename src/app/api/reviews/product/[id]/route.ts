import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";

// GET /api/reviews/product/[id] - Get reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await connectDB();

    const [reviews, totalCount] = await Promise.all([
      Review.find({ product: id, isApproved: true })
        .populate("user", "name")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: id, isApproved: true }),
    ]);

    return NextResponse.json(
      {
        success: true,
        reviews,
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
    console.error("Get reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
