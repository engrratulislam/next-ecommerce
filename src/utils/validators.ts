import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.number().int().min(0).default(10),
  tags: z.array(z.string()).optional(),
  productType: z.enum(["digital", "physical", "bundle"]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isTaxable: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const addressSchema = z.object({
  type: z.enum(["shipping", "billing", "both"]),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean().default(false),
});

export const reviewSchema = z.object({
  product: z.string().min(1, "Product is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderValue: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usagePerCustomer: z.number().int().positive().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  isActive: z.boolean().default(true),
});
