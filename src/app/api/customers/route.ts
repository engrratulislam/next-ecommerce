import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

// GET /api/customers - Get all customers (admin only)
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const [customers, totalCount] = await Promise.all([
      User.find({ role: "customer" })
        .select("-password")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: "customer" }),
    ]);

    // Get order counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ user: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: customer._id, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);

        return {
          ...customer,
          orderCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        customers: customersWithStats,
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
    console.error("Get customers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
