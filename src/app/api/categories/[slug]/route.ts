import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

// GET /api/categories/[slug] - Get category with products
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    await connectDB();

    // Find category by slug or ID
    let category;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      category = await Category.findById(slug).lean();
    } else {
      category = await Category.findOne({ slug }).lean();
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Get subcategories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true,
    }).lean();

    // Get products in this category
    const [products, totalCount] = await Promise.all([
      Product.find({ category: category._id, isActive: true })
        .select("-__v")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ category: category._id, isActive: true }),
    ]);

    return NextResponse.json(
      {
        success: true,
        category,
        subcategories,
        products,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page < Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[slug] - Update category (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { slug } = params;
    const body = await request.json();
    await connectDB();

    let category;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      category = await Category.findByIdAndUpdate(slug, body, {
        new: true,
        runValidators: true,
      });
    } else {
      category = await Category.findOneAndUpdate({ slug }, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully",
        category,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug] - Delete category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { slug } = params;
    await connectDB();

    // Find category
    let category;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      category = await Category.findById(slug);
    } else {
      category = await Category.findOne({ slug });
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${productCount} products. Please reassign products first.`,
        },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: category._id });
    if (subcategoryCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category with ${subcategoryCount} subcategories. Please delete subcategories first.`,
        },
        { status: 400 }
      );
    }

    await category.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
