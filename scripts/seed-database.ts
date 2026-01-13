import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load environment variables FIRST
config({ path: resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

// Define schemas inline to avoid import issues
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  image: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
  },
}, { timestamps: true });

categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true },
  comparePrice: Number,
  cost: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  images: [String],
  thumbnail: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  tags: [String],
  productType: { type: String, enum: ["digital", "physical", "bundle"], default: "physical" },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isTaxable: { type: Boolean, default: true },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  variants: [{
    name: String,
    options: [{
      value: String,
      price: Number,
      stock: Number,
      sku: String,
    }],
  }],
}, { timestamps: true });

productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronic gadgets and devices",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    isActive: true,
    order: 1,
    seo: {
      metaTitle: "Electronics - Shop Latest Gadgets",
      metaDescription: "Browse our collection of cutting-edge electronics",
    },
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Fashion and apparel for all occasions",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
    isActive: true,
    order: 2,
    seo: {
      metaTitle: "Clothing - Fashion & Apparel",
      metaDescription: "Discover trendy clothing for men and women",
    },
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Everything for your home and garden",
    image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
    isActive: true,
    order: 3,
    seo: {
      metaTitle: "Home & Garden - Decor & Furniture",
      metaDescription: "Transform your living space with our products",
    },
  },
  {
    name: "Books",
    slug: "books",
    description: "Wide selection of books across all genres",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
    isActive: true,
    order: 4,
    seo: {
      metaTitle: "Books - Fiction, Non-Fiction & More",
      metaDescription: "Explore our vast collection of books",
    },
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Gear up for your outdoor adventures",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    isActive: true,
    order: 5,
    seo: {
      metaTitle: "Sports & Outdoors - Adventure Gear",
      metaDescription: "Quality sports and outdoor equipment",
    },
  },
];

const getProductsData = (categoryIds: Record<string, string>) => [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.",
    shortDescription: "Premium wireless headphones with ANC",
    price: 199.99,
    comparePrice: 249.99,
    cost: 120.00,
    category: categoryIds.Electronics,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    sku: "ELEC-HEAD-001",
    stock: 50,
    tags: ["wireless", "bluetooth", "headphones"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Smart Watch Pro",
    slug: "smart-watch-pro",
    description: "Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 7-day battery life.",
    shortDescription: "Advanced fitness tracking smartwatch",
    price: 299.99,
    comparePrice: 399.99,
    category: categoryIds.Electronics,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    sku: "ELEC-WATCH-001",
    stock: 35,
    tags: ["smartwatch", "fitness", "wearable"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    description: "Comfortable 100% cotton t-shirt. Soft, breathable, and perfect for everyday wear.",
    shortDescription: "100% cotton comfortable t-shirt",
    price: 24.99,
    comparePrice: 34.99,
    category: categoryIds.Clothing,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    sku: "CLOTH-TSHIRT-001",
    stock: 100,
    tags: ["t-shirt", "cotton", "casual"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Denim Jeans - Slim Fit",
    slug: "denim-jeans-slim-fit",
    description: "Premium denim jeans with slim fit design. Durable and stylish.",
    shortDescription: "Premium slim fit denim jeans",
    price: 59.99,
    category: categoryIds.Clothing,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    sku: "CLOTH-JEANS-001",
    stock: 60,
    tags: ["jeans", "denim"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Modern Table Lamp",
    slug: "modern-table-lamp",
    description: "Elegant modern table lamp with adjustable brightness.",
    shortDescription: "Elegant adjustable table lamp",
    price: 45.99,
    category: categoryIds["Home & Garden"],
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    sku: "HOME-LAMP-001",
    stock: 40,
    tags: ["lamp", "lighting", "home decor"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Ceramic Plant Pot Set",
    slug: "ceramic-plant-pot-set",
    description: "Set of 3 handcrafted ceramic plant pots with drainage holes.",
    shortDescription: "Set of 3 ceramic plant pots",
    price: 34.99,
    category: categoryIds["Home & Garden"],
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
    sku: "HOME-POT-001",
    stock: 55,
    tags: ["plant pot", "ceramic", "garden"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "The Art of Programming",
    slug: "the-art-of-programming",
    description: "Comprehensive guide to modern programming practices.",
    shortDescription: "Complete programming guide",
    price: 39.99,
    category: categoryIds.Books,
    images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    sku: "BOOK-PROG-001",
    stock: 75,
    tags: ["book", "programming", "education"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Mystery Novel Collection",
    slug: "mystery-novel-collection",
    description: "Bestselling mystery novel that will keep you on the edge of your seat.",
    shortDescription: "Bestselling mystery thriller",
    price: 19.99,
    category: categoryIds.Books,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    sku: "BOOK-MYST-001",
    stock: 90,
    tags: ["book", "mystery", "fiction"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description: "Extra thick yoga mat with non-slip surface. Includes carrying strap.",
    shortDescription: "Premium non-slip yoga mat",
    price: 29.99,
    category: categoryIds["Sports & Outdoors"],
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    sku: "SPORT-YOGA-001",
    stock: 65,
    tags: ["yoga", "fitness", "exercise"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Camping Backpack 50L",
    slug: "camping-backpack-50l",
    description: "Durable 50L camping backpack with multiple compartments and rain cover.",
    shortDescription: "50L durable camping backpack",
    price: 79.99,
    category: categoryIds["Sports & Outdoors"],
    images: ["https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400",
    sku: "SPORT-BACK-001",
    stock: 30,
    tags: ["backpack", "camping", "hiking"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    console.log(`📍 Connecting to: ${DATABASE_URL?.replace(/\/\/.*@/, "//***:***@")}`);
    
    await mongoose.connect(DATABASE_URL);
    console.log("✅ Connected to database");

    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Existing data cleared");

    console.log("📁 Inserting categories...");
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Inserted ${categories.length} categories`);

    const categoryIds: Record<string, string> = {};
    categories.forEach((cat: any) => {
      categoryIds[cat.name] = cat._id.toString();
    });

    console.log("📦 Inserting products...");
    const productsData = getProductsData(categoryIds);
    const products = await Product.insertMany(productsData);
    console.log(`✅ Inserted ${products.length} products`);

    console.log("\n🎉 Database seeding completed!");
    console.log("=".repeat(50));
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log("=".repeat(50));

    console.log("\n📊 Categories Summary:");
    for (const category of categories) {
      const productCount = await Product.countDocuments({ category: (category as any)._id });
      console.log(`  - ${(category as any).name}: ${productCount} products`);
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from database");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
