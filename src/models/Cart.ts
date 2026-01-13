import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    variant?: {
      name: string;
      value: string;
    };
  }>;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        variant: {
          name: String,
          value: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure either user or sessionId is present
cartSchema.pre("save", function (next: any) {
  if (!this.user && !this.sessionId) {
    throw new Error("Cart must have either user or sessionId");
  }
  next();
});

// Index for abandoned cart queries
cartSchema.index({ updatedAt: 1 });

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
