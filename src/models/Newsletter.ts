import mongoose, { Schema, Document, Model } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const newsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  isSubscribed: {
    type: Boolean,
    default: true,
    index: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
  },
});

// Update unsubscribedAt when isSubscribed changes to false
newsletterSchema.pre("save", function (next: any) {
  if (this.isModified("isSubscribed") && !this.isSubscribed) {
    this.unsubscribedAt = new Date();
  }
  next();
});

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter ||
  mongoose.model<INewsletter>("Newsletter", newsletterSchema);

export default Newsletter;
