import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Connect to database
    await connectDB();

    // Check if id is valid ObjectId or slug
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("category", "name slug")
        .populate("relatedProducts", "name slug price thumbnail rating")
        .lean();
    } else {
      product = await Product.findOne({ slug: id })
        .populate("category", "name slug")
        .populate("relatedProducts", "name slug price thumbnail rating")
        .lean();
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // Increment view count asynchronously (don't wait)
    if (mongoose.Types.ObjectId.isValid(id)) {
      Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    } else {
      Product.findOneAndUpdate({ slug: id }, { $inc: { viewCount: 1 } }).exec();
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Connect to database
    await connectDB();

    // Update product
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Connect to database
    await connectDB();

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    // TODO: Delete product images from storage
    // TODO: Remove product from carts and wishlists

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
