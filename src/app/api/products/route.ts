import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";

// GET /api/products - Get all products with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");
    const inStock = searchParams.get("inStock");
    const sort = searchParams.get("sort") || "-createdAt";

    // Build query
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      query.tags = { $in: tags.split(",") };
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Connect to database
    await connectDB();

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .select("-__v")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
        },
        filters: {
          category,
          minPrice,
          maxPrice,
          search,
          tags,
          inStock,
          sort,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Admin access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Connect to database
    await connectDB();

    // Create product
    const product = await Product.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
