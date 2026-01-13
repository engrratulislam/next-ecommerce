import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Stripe from "stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// POST /api/payment/stripe/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    await connectDB();

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) {
      console.error("Order ID not found in payment intent metadata");
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update order payment status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentIntent.id;
    await order.save();

    console.log(`Payment successful for order: ${order.orderNumber}`);

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
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    const order = await Order.findById(orderId);
    if (!order) return;

    order.paymentStatus = "failed";
    order.notes = `${order.notes || ""}\nPayment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`;
    await order.save();

    console.log(`Payment failed for order: ${order.orderNumber}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;
    if (!paymentIntentId) return;

    const order = await Order.findOne({ paymentId: paymentIntentId } as any);
    if (!order) return;

    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    await order.save();

    console.log(`Refund processed for order: ${order.orderNumber}`);
  } catch (error) {
    console.error("Error handling refund:", error);
  }
}
