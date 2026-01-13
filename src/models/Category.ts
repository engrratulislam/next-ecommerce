import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  getSubcategories(): Promise<ICategory[]>;
  getProductCount(): Promise<number>;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, "Meta title cannot exceed 60 characters"],
      },
      metaDescription: {
        type: String,
        maxlength: [160, "Meta description cannot exceed 160 characters"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Get all subcategories
categorySchema.methods.getSubcategories = async function (): Promise<ICategory[]> {
  return await Category.find({ parent: this._id, isActive: true }).sort({ order: 1 });
};

// Get product count for this category
categorySchema.methods.getProductCount = async function (): Promise<number> {
  const Product = mongoose.model("Product");
  return await Product.countDocuments({ category: this._id, isActive: true });
};

// Indexes
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ name: "text" });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

export default Category;
