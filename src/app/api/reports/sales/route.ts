import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// GET /api/reports/sales - Get sales report (admin only)
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
    const period = searchParams.get("period") || "month"; // day, week, month, year

    await connectDB();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get sales statistics
    const [totalSales, orderCount, revenueByStatus] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),
    ]);

    // Get daily/weekly sales trend
    const salesTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(
      {
        success: true,
        period,
        summary: {
          totalRevenue: totalSales[0]?.total || 0,
          orderCount,
          averageOrderValue: orderCount > 0 ? (totalSales[0]?.total || 0) / orderCount : 0,
        },
        revenueByStatus,
        salesTrend,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get sales report error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sales report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
