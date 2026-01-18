import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

// GET /api/reports/customers - Get customer report (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orderCount: 1,
        },
      },
    ]);

    // Get customer statistics
    const [customerStats, newCustomers] = await Promise.all([
      User.aggregate([
        { $match: { role: 'customer' } },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
          },
        },
      ]),
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    // Get customer growth trend (last 30 days)
    const customerGrowth = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json(
      {
        success: true,
        topCustomers,
        stats: {
          totalCustomers: customerStats[0]?.totalCustomers || 0,
          newCustomers,
        },
        customerGrowth,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get customer report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customer report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
