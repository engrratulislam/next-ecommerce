import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET /api/products/search - Search products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Perform text search
    const products = await Product.find({
      $text: { $search: query },
      isActive: true,
    })
      .populate("category", "name slug")
      .select("name slug price thumbnail rating reviewCount stock")
      .limit(limit)
      .lean();

    // Get search suggestions based on product names
    const suggestions = await Product.find({
      name: { $regex: query, $options: "i" },
      isActive: true,
    })
      .select("name")
      .limit(5)
      .lean();

    return NextResponse.json(
      {
        success: true,
        query,
        products,
        suggestions: suggestions.map((s) => s.name),
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
