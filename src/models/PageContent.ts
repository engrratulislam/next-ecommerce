import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

export interface IPageContent extends Document {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageContentSchema = new Schema<IPageContent>(
  {
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title if not provided
pageContentSchema.pre("save", function (next: any) {
  if (this.isModified("title") && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const PageContent: Model<IPageContent> =
  mongoose.models.PageContent ||
  mongoose.model<IPageContent>("PageContent", pageContentSchema);

export default PageContent;
