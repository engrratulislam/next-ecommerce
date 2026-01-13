import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";

const refundSchema = z.object({
  amount: z.number().min(0),
  reason: z.string().min(1, "Refund reason is required"),
});

// POST /api/orders/[id]/refund - Process refund (admin only)
export async function POST(
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
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { amount, reason } = validation.data;

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is eligible for refund
    if (order.paymentStatus !== "paid" && order.paymentStatus !== "refund_pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Order payment status does not allow refund",
        },
        { status: 400 }
      );
    }

    // Process refund using model method
    await order.processRefund(amount, reason);

    // TODO: Process actual refund through payment gateway
    // TODO: Send refund confirmation email

    return NextResponse.json(
      {
        success: true,
        message: "Refund processed successfully",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Process refund error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process refund",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
