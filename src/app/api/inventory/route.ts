import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET /api/inventory - Get inventory status (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lowStock = searchParams.get("lowStock") === "true";

    await connectDB();

    let query: any = { isActive: true };
    if (lowStock) {
      query.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    }

    const products = await Product.find(query)
      .select("name sku stock lowStockThreshold price")
      .populate("category", "name")
      .sort("stock")
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
    console.error("Get inventory error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
