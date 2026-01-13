import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
      index: true,
    },
    products: [
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

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
