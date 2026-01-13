import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendOrderConfirmationEmail } from "@/lib/email";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// POST /api/payment/paypal/capture - Capture PayPal payment
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
    const { paypalOrderId } = body;

    if (!paypalOrderId) {
      return NextResponse.json(
        { success: false, error: "PayPal order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the payment
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await response.json();

    if (!response.ok || captureData.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment capture failed",
          details: captureData,
        },
        { status: 400 }
      );
    }

    // Find and update the order
    const order = await Order.findOne({ paymentId: paypalOrderId } as any);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paypalOrderId;
    await order.save();

    // Send order confirmation email
    try {
      const user = await User.findById((order as any).customer);
      if (user?.email) {
        await sendOrderConfirmationEmail(user.email, {
          orderNumber: order.orderNumber,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
          shippingAddress: order.shippingAddress,
        });
        console.log("Order confirmation email sent to:", user.email);
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment captured successfully",
        order,
        captureData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Capture PayPal payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to capture payment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
