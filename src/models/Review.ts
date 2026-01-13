import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  adminReply?: {
    message: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    adminReply: {
      message: String,
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for queries
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);

export default Review;
