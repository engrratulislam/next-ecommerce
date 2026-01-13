import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// POST /api/payment/stripe/create-intent - Create Stripe payment intent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    const userId = (session.user as any).id;
    if ((order as any).customer.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Check if order already has a payment intent
    if (order.paymentId && order.paymentStatus !== "failed") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment intent already exists for this order",
        },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: "usd", // TODO: Get from settings
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.paymentId = paymentIntent.id;
    await order.save();

    return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create Stripe payment intent error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment intent",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
