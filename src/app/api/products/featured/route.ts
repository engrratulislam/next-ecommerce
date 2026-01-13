import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET /api/products/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Connect to database
    await connectDB();

    // Get featured products
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate("category", "name slug")
      .select("-__v")
      .sort("-salesCount -createdAt")
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get featured products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch featured products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
