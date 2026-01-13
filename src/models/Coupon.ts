import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  usagePerCustomer?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories?: mongoose.Types.ObjectId[];
  applicableProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  canBeUsedBy(userId: string, usageCount: number): boolean;
  calculateDiscount(orderTotal: number): number;
  incrementUsage(): Promise<ICoupon>;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    minOrderValue: {
      type: Number,
      min: [0, "Minimum order value cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount cannot be negative"],
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usagePerCustomer: {
      type: Number,
      min: [1, "Usage per customer must be at least 1"],
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validate dates
couponSchema.pre("save", function (next: any) {
  if (this.validFrom >= this.validUntil) {
    throw new Error("Valid from date must be before valid until date");
  }
  next();
});

// Check if coupon is valid
couponSchema.methods.isValid = function (): boolean {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (now < this.validFrom || now > this.validUntil) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  
  return true;
};

// Check if coupon can be used by a specific user
couponSchema.methods.canBeUsedBy = function (
  userId: string,
  userUsageCount: number
): boolean {
  if (!this.isValid()) return false;
  if (this.usagePerCustomer && userUsageCount >= this.usagePerCustomer) return false;
  
  return true;
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function (orderTotal: number): number {
  if (!this.isValid()) return 0;
  if (this.minOrderValue && orderTotal < this.minOrderValue) return 0;

  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (orderTotal * this.discountValue) / 100;
    
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.discountType === "fixed") {
    discount = this.discountValue;
    
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }

  return Math.round(discount * 100) / 100;
};

// Increment usage count
couponSchema.methods.incrementUsage = async function (): Promise<ICoupon> {
  this.usageCount += 1;
  return await this.save();
};

// Indexes
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validUntil: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
