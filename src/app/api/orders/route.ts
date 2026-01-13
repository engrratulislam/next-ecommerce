import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { sendOrderConfirmationEmail } from "@/lib/email";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().min(1),
      price: z.number().min(0),
      variant: z
        .object({
          name: z.string(),
          value: z.string(),
        })
        .optional(),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z
    .object({
      fullName: z.string().min(1),
      phone: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
  paymentMethod: z.enum([
    "card",
    "paypal",
    "stripe",
    "sslcommerz",
    "cash_on_delivery",
  ]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

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

    const { items, shippingAddress, billingAddress, paymentMethod, couponCode, notes } =
      validation.data;

    await connectDB();

    // Validate all products and stock
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(mongoSession);
      if (!product || !product.isActive) {
        throw new Error(`Product ${item.product} not found or inactive`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Only ${product.stock} available`
        );
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });

      subtotal += product.price * item.quantity;
    }

    // Calculate shipping (TODO: implement shipping logic)
    const shipping = 50; // Fixed shipping for now

    // Calculate tax (TODO: get from settings)
    const taxRate = 0.1; // 10%
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode }).session(
        mongoSession
      );

      if (!coupon) {
        throw new Error("Invalid coupon code");
      }

      if (!coupon.isValid()) {
        throw new Error("Coupon is not valid or has expired");
      }

      const userId = (session.user as any).id;
      if (!(await coupon.canBeUsedBy(userId))) {
        throw new Error("You cannot use this coupon");
      }

      discount = coupon.calculateDiscount(subtotal);
      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };

      // Increment coupon usage
      await coupon.incrementUsage(userId);
    }

    // Calculate total
    const total = subtotal + shipping + tax - discount;

    // Create order
    const order = await Order.create(
      [
        {
          user: (session.user as any).id,
          items: validatedItems,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          paymentMethod,
          coupon: appliedCoupon,
          notes,
          orderStatus: "pending",
          paymentStatus: "pending",
        },
      ],
      { session: mongoSession }
    );

    // Deduct stock from products
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        },
        { session: mongoSession }
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: (session.user as any).id },
      { items: [] },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    // Send order confirmation email
    try {
      const user = await User.findById((session.user as any).id);
      if (user?.email) {
        await sendOrderConfirmationEmail(user.email, {
          orderNumber: order[0].orderNumber,
          items: validatedItems,
          subtotal,
          shipping,
          tax,
          total,
          shippingAddress,
        });
        console.log("Order confirmation email sent to:", user.email);
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    // TODO: Create payment intent if not cash on delivery

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: order[0],
      },
      { status: 201 }
    );
  } catch (error) {
    await mongoSession.abortTransaction();
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    mongoSession.endSession();
  }
}

// GET /api/orders - Get user orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    await connectDB();

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";

    // Admin can see all orders, users see only their orders
    const query = isAdmin ? {} : { user: userId };

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate("user", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
