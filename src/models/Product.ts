import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  images: string[];
  thumbnail: string;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold: number;
  tags: string[];
  productType: "digital" | "physical" | "bundle";
  downloadUrl?: string;
  fileSize?: string;
  version?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: Array<{
    name: string;
    options: Array<{
      value: string;
      price: number;
      stock: number;
      sku: string;
    }>;
  }>;
  isFeatured: boolean;
  isActive: boolean;
  isTaxable: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  relatedProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  updateStock(quantity: number, operation: "add" | "subtract"): Promise<IProduct>;
  incrementViews(): Promise<IProduct>;
  updateRating(): Promise<void>;
  checkLowStock(): boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },
    subcategory: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      required: [true, "Product thumbnail is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      index: true,
      uppercase: true,
    },
    barcode: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    productType: {
      type: String,
      enum: ["digital", "physical", "bundle"],
      default: "physical",
    },
    downloadUrl: {
      type: String,
    },
    fileSize: {
      type: String,
    },
    version: {
      type: String,
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    variants: [
      {
        name: { type: String, required: true },
        options: [
          {
            value: { type: String, required: true },
            price: { type: Number, required: true },
            stock: { type: Number, required: true },
            sku: { type: String, required: true },
          },
        ],
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isTaxable: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    relatedProducts: [
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

// Generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Update stock method
productSchema.methods.updateStock = async function (
  quantity: number,
  operation: "add" | "subtract"
): Promise<IProduct> {
  if (operation === "add") {
    this.stock += quantity;
  } else if (operation === "subtract") {
    if (this.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    this.stock -= quantity;
  }
  return await this.save();
};

// Increment views method
productSchema.methods.incrementViews = async function (): Promise<IProduct> {
  this.viewCount += 1;
  return await this.save();
};

// Update rating method
productSchema.methods.updateRating = async function (): Promise<void> {
  const Review = mongoose.model("Review");
  const result = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    this.rating = Math.round(result[0].averageRating * 10) / 10;
    this.reviewCount = result[0].count;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }

  await this.save();
};

// Check low stock method
productSchema.methods.checkLowStock = function (): boolean {
  return this.stock <= this.lowStockThreshold;
};

// Indexes
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
