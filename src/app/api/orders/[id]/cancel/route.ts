import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

// POST /api/orders/[id]/cancel - Cancel order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    await connectDB();

    const order = await Order.findById(id).session(mongoSession);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isAdmin && order.user.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (["delivered", "cancelled", "refunded"].includes(order.orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel order with status: ${order.orderStatus}`,
        },
        { status: 400 }
      );
    }

    // Restore stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: item.quantity, salesCount: -item.quantity },
        },
        { session: mongoSession }
      );
    }

    // Update order status
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.notes = reason
      ? `${order.notes || ""}\nCancellation reason: ${reason}`
      : order.notes;

    // If payment was completed, mark for refund
    if (order.paymentStatus === "paid") {
      order.paymentStatus = "refund_pending";
    }

    await order.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    // TODO: Send cancellation email
    // TODO: Initiate refund if payment was completed

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    await mongoSession.abortTransaction();
    console.error("Cancel order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cancel order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    mongoSession.endSession();
  }
}
