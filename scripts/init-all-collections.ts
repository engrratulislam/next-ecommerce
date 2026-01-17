/**
 * Complete Database Initialization Script
 * 
 * This script creates ALL collections with initial data:
 * - Users (sample customers only - admin credentials in separate 'admins' collection)
 * - Categories
 * - Products
 * - Settings
 * - PageContents
 * - Coupons
 * - All other collections will be created on-demand
 * 
 * Run with: npm run init:db
 * For admin account: npm run seed:admin
 */

import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

// Import models
import User from "../src/models/User";
import Category from "../src/models/Category";
import Product from "../src/models/Product";
import Settings from "../src/models/Settings";
import PageContent from "../src/models/PageContent";
import Coupon from "../src/models/Coupon";

// Sample Data
const sampleCustomers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "customer123",
    role: "customer",
    phone: "+1234567890",
    isVerified: true,
    isActive: true,
    addresses: [
      {
        type: "both",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true,
      },
    ],
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "customer123",
    role: "customer",
    phone: "+1234567891",
    isVerified: true,
    isActive: true,
    addresses: [
      {
        type: "shipping",
        street: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
        isDefault: true,
      },
    ],
  },
];

const categories = [
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

const getProducts = (categoryIds: Record<string, string>) => [
  {
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
    shortDescription: "Premium wireless headphones with ANC",
    price: 199.99,
    comparePrice: 249.99,
    cost: 120.0,
    category: categoryIds.Electronics,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    ],
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    sku: "ELEC-HEAD-001",
    stock: 50,
    lowStockThreshold: 10,
    tags: ["wireless", "bluetooth", "headphones", "audio"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
    weight: 250,
    seo: {
      metaTitle: "Wireless Bluetooth Headphones - Premium Audio",
      metaDescription: "Experience superior sound with our premium wireless headphones",
      keywords: ["wireless headphones", "bluetooth", "noise cancellation"],
    },
  },
  {
    name: "Smart Watch Pro",
    slug: "smart-watch-pro",
    description: "Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 7-day battery life. Water resistant up to 50m.",
    shortDescription: "Advanced fitness tracking smartwatch",
    price: 299.99,
    comparePrice: 399.99,
    cost: 180.0,
    category: categoryIds.Electronics,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    sku: "ELEC-WATCH-001",
    stock: 35,
    tags: ["smartwatch", "fitness", "wearable", "health"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    description: "Comfortable 100% cotton t-shirt. Soft, breathable, and perfect for everyday wear. Available in multiple colors and sizes.",
    shortDescription: "100% cotton comfortable t-shirt",
    price: 24.99,
    comparePrice: 34.99,
    cost: 12.0,
    category: categoryIds.Clothing,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    sku: "CLOTH-TSHIRT-001",
    stock: 100,
    tags: ["t-shirt", "cotton", "casual", "fashion"],
    productType: "physical",
    isActive: true,
    variants: [
      {
        name: "Size",
        options: [
          { value: "S", price: 24.99, stock: 25, sku: "CLOTH-TSHIRT-001-S" },
          { value: "M", price: 24.99, stock: 30, sku: "CLOTH-TSHIRT-001-M" },
          { value: "L", price: 24.99, stock: 25, sku: "CLOTH-TSHIRT-001-L" },
          { value: "XL", price: 24.99, stock: 20, sku: "CLOTH-TSHIRT-001-XL" },
        ],
      },
    ],
  },
  {
    name: "Denim Jeans - Slim Fit",
    slug: "denim-jeans-slim-fit",
    description: "Premium denim jeans with slim fit design. Durable construction with stretch fabric for maximum comfort.",
    shortDescription: "Premium slim fit denim jeans",
    price: 59.99,
    cost: 30.0,
    category: categoryIds.Clothing,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    sku: "CLOTH-JEANS-001",
    stock: 60,
    tags: ["jeans", "denim", "fashion"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Modern Table Lamp",
    slug: "modern-table-lamp",
    description: "Elegant modern table lamp with adjustable brightness. Perfect for bedroom, living room, or office.",
    shortDescription: "Elegant adjustable table lamp",
    price: 45.99,
    cost: 22.0,
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
    description: "Set of 3 handcrafted ceramic plant pots with drainage holes. Modern minimalist design.",
    shortDescription: "Set of 3 ceramic plant pots",
    price: 34.99,
    cost: 15.0,
    category: categoryIds["Home & Garden"],
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
    sku: "HOME-POT-001",
    stock: 55,
    tags: ["plant pot", "ceramic", "garden", "decor"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "The Art of Programming",
    slug: "the-art-of-programming",
    description: "Comprehensive guide to modern programming practices. Covers algorithms, data structures, and best practices.",
    shortDescription: "Complete programming guide",
    price: 39.99,
    cost: 18.0,
    category: categoryIds.Books,
    images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
    sku: "BOOK-PROG-001",
    stock: 75,
    tags: ["book", "programming", "education", "technology"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Mystery Novel Collection",
    slug: "mystery-novel-collection",
    description: "Bestselling mystery novel that will keep you on the edge of your seat. Perfect for thriller enthusiasts.",
    shortDescription: "Bestselling mystery thriller",
    price: 19.99,
    cost: 8.0,
    category: categoryIds.Books,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    sku: "BOOK-MYST-001",
    stock: 90,
    tags: ["book", "mystery", "fiction", "thriller"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description: "Extra thick yoga mat with non-slip surface. Includes carrying strap. Made from eco-friendly materials.",
    shortDescription: "Premium non-slip yoga mat",
    price: 29.99,
    cost: 12.0,
    category: categoryIds["Sports & Outdoors"],
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    sku: "SPORT-YOGA-001",
    stock: 65,
    tags: ["yoga", "fitness", "exercise", "wellness"],
    productType: "physical",
    isActive: true,
  },
  {
    name: "Camping Backpack 50L",
    slug: "camping-backpack-50l",
    description: "Durable 50L camping backpack with multiple compartments and rain cover. Perfect for hiking and outdoor adventures.",
    shortDescription: "50L durable camping backpack",
    price: 79.99,
    cost: 40.0,
    category: categoryIds["Sports & Outdoors"],
    images: ["https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800"],
    thumbnail: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400",
    sku: "SPORT-BACK-001",
    stock: 30,
    tags: ["backpack", "camping", "hiking", "outdoor"],
    productType: "physical",
    isFeatured: true,
    isActive: true,
  },
];

const settingsData = {
  storeName: "Next E-Commerce",
  storeDescription: "Your one-stop shop for quality products",
  contactEmail: "contact@nextecommerce.com",
  contactPhone: "+1-800-SHOP-NOW",
  address: "123 Commerce Street, Business City, ST 12345",
  currency: "USD",
  currencySymbol: "$",
  timezone: "UTC",
  paymentGateways: {
    stripe: {
      enabled: false,
    },
    paypal: {
      enabled: false,
    },
    sslcommerz: {
      enabled: false,
    },
    cod: {
      enabled: true,
    },
  },
  shipping: {
    flatRate: 10.0,
    freeShippingThreshold: 100.0,
  },
  tax: {
    enabled: true,
    rate: 8.5,
    includeInPrice: false,
  },
  email: {
    fromName: "Next E-Commerce",
    fromEmail: "noreply@nextecommerce.com",
  },
  seo: {
    metaTitle: "Next E-Commerce - Quality Products Online",
    metaDescription: "Shop the best products at competitive prices with fast shipping",
  },
  socialMedia: {
    facebook: "https://facebook.com/nextecommerce",
    twitter: "https://twitter.com/nextecommerce",
    instagram: "https://instagram.com/nextecommerce",
  },
};

const pageContents = [
  {
    slug: "about",
    title: "About Us",
    content: `
      <h1>About Next E-Commerce</h1>
      <p>Welcome to Next E-Commerce, your number one source for all things shopping. We're dedicated to giving you the very best of products, with a focus on quality, customer service, and uniqueness.</p>
      <p>Founded in 2024, Next E-Commerce has come a long way from its beginnings. When we first started out, our passion for eco-friendly and sustainable products drove us to start our own business.</p>
      <p>We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.</p>
    `,
    metaTitle: "About Us - Next E-Commerce",
    metaDescription: "Learn more about Next E-Commerce and our commitment to quality",
    isPublished: true,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    content: `
      <h1>Privacy Policy</h1>
      <h2>Information We Collect</h2>
      <p>We collect information that you provide directly to us, including name, email address, postal address, phone number, and payment information.</p>
      <h2>How We Use Your Information</h2>
      <p>We use the information we collect to process your orders, communicate with you, and improve our services.</p>
      <h2>Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information.</p>
    `,
    metaTitle: "Privacy Policy - Next E-Commerce",
    metaDescription: "Read our privacy policy and learn how we protect your data",
    isPublished: true,
  },
  {
    slug: "terms-conditions",
    title: "Terms and Conditions",
    content: `
      <h1>Terms and Conditions</h1>
      <h2>General Terms</h2>
      <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
      <h2>Use License</h2>
      <p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p>
      <h2>Disclaimer</h2>
      <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied.</p>
    `,
    metaTitle: "Terms and Conditions - Next E-Commerce",
    metaDescription: "Read our terms and conditions before using our service",
    isPublished: true,
  },
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    content: `
      <h1>Shipping & Returns Policy</h1>
      <h2>Shipping Information</h2>
      <p>We offer free shipping on orders over $100. Standard shipping takes 5-7 business days.</p>
      <h2>Return Policy</h2>
      <p>You may return most new, unopened items within 30 days of delivery for a full refund.</p>
      <h2>Exchanges</h2>
      <p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p>
    `,
    metaTitle: "Shipping & Returns - Next E-Commerce",
    metaDescription: "Learn about our shipping and returns policy",
    isPublished: true,
  },
];

const coupons = [
  {
    code: "WELCOME10",
    description: "Welcome discount for new customers",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 50,
    maxDiscountAmount: 20,
    usageLimit: 1000,
    usagePerCustomer: 1,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    isActive: true,
  },
  {
    code: "SAVE20",
    description: "Get $20 off on orders over $200",
    discountType: "fixed",
    discountValue: 20,
    minOrderValue: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    isActive: true,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on all orders",
    discountType: "fixed",
    discountValue: 10, // Assuming $10 shipping cost
    minOrderValue: 0,
    usageLimit: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    isActive: true,
  },
];

async function initializeDatabase() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 INITIALIZING ALL DATABASE COLLECTIONS");
    console.log("=".repeat(60) + "\n");

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(DATABASE_URL!);
    console.log("✅ Connected successfully\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Settings.deleteMany({}),
      PageContent.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    console.log("✅ Database cleared\n");

    // 1. Create Sample Customers
    console.log("👤 Creating sample customers...");
    const customers = [];
    for (const customer of sampleCustomers) {
      // Password will be hashed by the pre-save hook in User model
      const user = await User.create(customer);
      customers.push(user);
      console.log(`   ✅ Customer created: ${user.email}`);
    }
    console.log(`✅ Total customers created: ${customers.length}\n`);

    // 2. Create Categories
    console.log("📁 Creating categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created\n`);

    // 3. Create Products
    console.log("📦 Creating products...");
    const categoryIds: Record<string, string> = {};
    createdCategories.forEach((cat: any) => {
      categoryIds[cat.name] = cat._id.toString();
    });

    const productsData = getProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ ${createdProducts.length} products created\n`);

    // 4. Create Settings
    console.log("⚙️  Creating store settings...");
    const settings = await Settings.create(settingsData);
    console.log(`✅ Store settings created\n`);

    // 5. Create Page Contents
    console.log("📄 Creating CMS pages...");
    const pages = await PageContent.insertMany(pageContents);
    console.log(`✅ ${pages.length} pages created\n`);

    // 6. Create Coupons
    console.log("🎫 Creating coupons...");
    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ ${createdCoupons.length} coupons created\n`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE INITIALIZATION COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");

    console.log("📊 Summary:");
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(`   📁 Categories: ${createdCategories.length}`);
    console.log(`   📦 Products: ${createdProducts.length}`);
    console.log(`   📄 Pages: ${pages.length}`);
    console.log(`   🎫 Coupons: ${createdCoupons.length}`);
    console.log(`   ⚙️  Settings: 1`);
    console.log("\n");

    console.log("🔐 Sample Customer Login:");
    console.log(`   Email: ${sampleCustomers[0].email}`);
    console.log(`   Password: ${sampleCustomers[0].password}`);
    console.log("\n");

    console.log("⚠️  Admin Account:");
    console.log("   Run: npm run seed:admin");
    console.log("   This will create admin credentials in 'admins' collection");
    console.log("\n");

    console.log("📊 Categories with Product Count:");
    for (const category of createdCategories) {
      const productCount = await Product.countDocuments({ category: (category as any)._id });
      console.log(`   - ${(category as any).name}: ${productCount} products`);
    }
    console.log("\n");

    console.log("🎫 Active Coupons:");
    createdCoupons.forEach((coupon: any) => {
      console.log(`   - ${coupon.code}: ${coupon.description}`);
    });
    console.log("\n");

    console.log("📝 Note: The following collections will be created automatically:");
    console.log("   - admins (run 'npm run seed:admin' to create)");
    console.log("   - carts (when users add items to cart)");
    console.log("   - orders (when orders are placed)");
    console.log("   - reviews (when products are reviewed)");
    console.log("   - wishlists (when users save products)");
    console.log("   - newsletters (when users subscribe)");
    console.log("\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR INITIALIZING DATABASE:");
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
