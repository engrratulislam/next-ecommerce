import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";

// GET /api/categories - Get all categories with tree structure
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all active categories
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // Build category tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach((cat: any) => {
      categoryMap.set(cat._id.toString(), { ...cat, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat._id.toString());
      if (cat.parent) {
        const parentCategory = categoryMap.get(cat.parent.toString());
        if (parentCategory) {
          parentCategory.children.push(category);
        } else {
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Get product counts for each category
    const Product = (await import("@/models/Product")).default;
    for (const category of rootCategories) {
      category.productCount = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });
      
      // Count products in subcategories
      for (const child of category.children) {
        child.productCount = await Product.countDocuments({
          category: child._id,
          isActive: true,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        categories: rootCategories,
        count: rootCategories.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectDB();

    const category = await Category.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
