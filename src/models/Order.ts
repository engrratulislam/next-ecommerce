import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    image: string;
    sku: string;
    quantity: number;
    price: number;
    variant?: {
      name: string;
      value: string;
    };
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: "stripe" | "paypal" | "sslcommerz" | "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  paymentId?: string;
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  adminNotes?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  customerIP?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateTotal(): number;
  updateStatus(status: string): Promise<IOrder>;
  processRefund(amount: number, reason: string): Promise<IOrder>;
  addTracking(trackingNumber: string, courier: string, trackingUrl?: string): Promise<IOrder>;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, required: true },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        variant: {
          name: String,
          value: String,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      uppercase: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "sslcommerz", "razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
      index: true,
    },
    paymentId: {
      type: String,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    trackingNumber: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    courierName: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    customerIP: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Calculate total
orderSchema.methods.calculateTotal = function (): number {
  return this.subtotal + this.tax + this.shipping - this.discount;
};

// Update order status
orderSchema.methods.updateStatus = async function (status: string): Promise<IOrder> {
  this.orderStatus = status as any;
  
  if (status === "delivered") {
    this.deliveredAt = new Date();
  }
  
  return await this.save();
};

// Process refund
orderSchema.methods.processRefund = async function (
  amount: number,
  reason: string
): Promise<IOrder> {
  if (amount > this.total) {
    throw new Error("Refund amount cannot exceed order total");
  }

  this.refundAmount = (this.refundAmount || 0) + amount;
  this.refundReason = reason;
  this.refundedAt = new Date();

  if (this.refundAmount >= this.total) {
    this.paymentStatus = "refunded";
  } else {
    this.paymentStatus = "partially_refunded";
  }

  return await this.save();
};

// Add tracking information
orderSchema.methods.addTracking = async function (
  trackingNumber: string,
  courier: string,
  trackingUrl?: string
): Promise<IOrder> {
  this.trackingNumber = trackingNumber;
  this.courierName = courier;
  if (trackingUrl) {
    this.trackingUrl = trackingUrl;
  }
  this.orderStatus = "shipped";
  return await this.save();
};

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
