import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { sendOrderStatusEmail } from "@/lib/email";

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    await connectDB();

    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization (user can only see their own orders, admin can see all)
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isAdmin && order.user._id.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.orderStatus) {
      await order.updateStatus(body.orderStatus);
    }

    if (body.paymentStatus) {
      order.paymentStatus = body.paymentStatus;
    }

    if (body.trackingNumber || body.trackingUrl || body.carrier) {
      await order.addTracking(
        body.trackingNumber,
        body.carrier,
        body.trackingUrl
      );
    }

    await order.save();

    // Send status update email to customer
    try {
      const user = await User.findById(order.user);
      if (user?.email) {
        const trackingInfo = order.tracking
          ? {
              trackingNumber: order.tracking.trackingNumber,
              carrier: order.tracking.carrier,
              trackingUrl: order.tracking.trackingUrl,
            }
          : undefined;

        await sendOrderStatusEmail(
          user.email,
          order.orderNumber,
          order.orderStatus,
          trackingInfo
        );
        console.log("Order status email sent to:", user.email);
      }
    } catch (emailError) {
      console.error("Failed to send order status email:", emailError);
      // Don't fail the update if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order updated successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
