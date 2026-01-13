import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "";
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "";
const SSLCOMMERZ_API_BASE =
  process.env.SSLCOMMERZ_MODE === "live"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

// POST /api/payment/sslcommerz/init - Initialize SSLCommerz payment
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
    const order = await Order.findById(orderId).populate("customer", "name email phone");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    const userId = (session.user as any).id;
    if ((order as any).customer._id.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    const customer = (order as any).customer;

    // Prepare SSLCommerz payment data
    const paymentData = new URLSearchParams({
      store_id: SSLCOMMERZ_STORE_ID,
      store_passwd: SSLCOMMERZ_STORE_PASSWORD,
      total_amount: order.total.toFixed(2),
      currency: "BDT",
      tran_id: `${order.orderNumber}_${Date.now()}`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sslcommerz/ipn`,
      cus_name: customer.name,
      cus_email: customer.email,
      cus_phone: customer.phone || "N/A",
      cus_add1: order.shippingAddress.street,
      cus_city: order.shippingAddress.city,
      cus_state: order.shippingAddress.state,
      cus_postcode: order.shippingAddress.zipCode,
      cus_country: order.shippingAddress.country,
      shipping_method: "YES",
      product_name: `Order ${order.orderNumber}`,
      product_category: "E-commerce",
      product_profile: "general",
    });

    // Initialize payment session
    const response = await fetch(
      `${SSLCOMMERZ_API_BASE}/gwprocess/v4/api.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: paymentData.toString(),
      }
    );

    const data = await response.json();

    if (data.status !== "SUCCESS") {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize payment",
          details: data,
        },
        { status: 400 }
      );
    }

    // Update order with transaction ID
    order.paymentId = data.sessionkey;
    await order.save();

    return NextResponse.json(
      {
        success: true,
        gatewayUrl: data.GatewayPageURL,
        sessionkey: data.sessionkey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Initialize SSLCommerz payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize payment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
