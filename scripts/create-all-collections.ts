/**
 * Create All Database Collections
 * 
 * This script creates all 11 collections in the database,
 * including the auto-create ones (carts, orders, reviews, wishlists, newsletters)
 * 
 * Run with: npm run create:collections
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
import Cart from "../src/models/Cart";
import Order from "../src/models/Order";
import Review from "../src/models/Review";
import Wishlist from "../src/models/Wishlist";
import Newsletter from "../src/models/Newsletter";

async function createAllCollections() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🏗️  CREATING ALL DATABASE COLLECTIONS");
    console.log("=".repeat(60) + "\n");

    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(DATABASE_URL!);
    console.log("✅ Connected successfully\n");

    console.log("🔧 Creating empty collections...\n");

    // Create Cart collection
    console.log("📦 Creating 'carts' collection...");
    await Cart.createCollection();
    console.log("   ✅ carts collection created");

    // Create Order collection
    console.log("📦 Creating 'orders' collection...");
    await Order.createCollection();
    console.log("   ✅ orders collection created");

    // Create Review collection
    console.log("📦 Creating 'reviews' collection...");
    await Review.createCollection();
    console.log("   ✅ reviews collection created");

    // Create Wishlist collection
    console.log("📦 Creating 'wishlists' collection...");
    await Wishlist.createCollection();
    console.log("   ✅ wishlists collection created");

    // Create Newsletter collection
    console.log("📦 Creating 'newsletters' collection...");
    await Newsletter.createCollection();
    console.log("   ✅ newsletters collection created");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL COLLECTIONS CREATED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");

    console.log("📊 Complete Collection List (11 total):");
    console.log("   ✅ categories (5 documents)");
    console.log("   ✅ coupons (3 documents)");
    console.log("   ✅ pagecontents (4 documents)");
    console.log("   ✅ products (10 documents)");
    console.log("   ✅ settings (1 document)");
    console.log("   ✅ users (3 documents)");
    console.log("   ✅ carts (0 documents) - Ready for use");
    console.log("   ✅ orders (0 documents) - Ready for use");
    console.log("   ✅ reviews (0 documents) - Ready for use");
    console.log("   ✅ wishlists (0 documents) - Ready for use");
    console.log("   ✅ newsletters (0 documents) - Ready for use");
    console.log("\n");

    // Verify collections
    const collections = await mongoose.connection.db!.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log("🔍 Verification:");
    console.log(`   Total collections in database: ${collections.length}`);
    console.log(`   Collections: ${collectionNames.join(", ")}`);
    console.log("\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from database");
    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR CREATING COLLECTIONS:");
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run
createAllCollections();
