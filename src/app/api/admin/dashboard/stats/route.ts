import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

// GET /api/admin/dashboard/stats - Get dashboard statistics (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    await connectDB();

    // Get current month start date
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Calculate last month revenue for comparison
    const lastMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: lastMonthStart,
            $lt: currentMonthStart
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

    // Calculate current month revenue
    const currentMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: currentMonthStart }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueResult[0]?.total || 0;

    // Calculate revenue change percentage
    const revenueChange = lastMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Get last month orders for comparison
    const lastMonthOrders = await Order.countDocuments({
      createdAt: {
        $gte: lastMonthStart,
        $lt: currentMonthStart
      }
    });

    // Get current month orders
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });

    // Calculate orders change percentage
    const ordersChange = lastMonthOrders > 0
      ? Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : 0;

    // Get customer statistics
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Get last month customers for comparison
    const lastMonthCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: {
        $gte: lastMonthStart,
        $lt: currentMonthStart
      }
    });

    // Get current month customers
    const currentMonthCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: currentMonthStart }
    });

    // Calculate customers change percentage
    const customersChange = lastMonthCustomers > 0
      ? Math.round(((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100)
      : 0;

    // Get product statistics
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    });

    const stats = {
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        change: revenueChange
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        change: ordersChange
      },
      customers: {
        total: totalCustomers,
        change: customersChange
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts
      }
    };

    return NextResponse.json(
      {
        success: true,
        stats
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
