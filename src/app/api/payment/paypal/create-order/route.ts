import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

// Get PayPal access token
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

// POST /api/payment/paypal/create-order - Create PayPal order
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

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const paypalOrder = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order._id.toString(),
          amount: {
            currency_code: "USD",
            value: order.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: order.subtotal.toFixed(2),
              },
              shipping: {
                currency_code: "USD",
                value: order.shipping.toFixed(2),
              },
              tax_total: {
                currency_code: "USD",
                value: order.tax.toFixed(2),
              },
              discount: {
                currency_code: "USD",
                value: order.discount.toFixed(2),
              },
            },
          },
        },
      ],
      application_context: {
        brand_name: process.env.NEXT_PUBLIC_SITE_NAME || "E-commerce Store",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paypalOrder),
    });

    const paypalData = await response.json();

    if (!response.ok) {
      throw new Error(`PayPal API error: ${paypalData.message || "Unknown error"}`);
    }

    // Update order with PayPal order ID
    order.paymentId = paypalData.id;
    await order.save();

    return NextResponse.json(
      {
        success: true,
        orderId: paypalData.id,
        approveUrl: paypalData.links?.find((link: any) => link.rel === "approve")?.href,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create PayPal order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create PayPal order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
