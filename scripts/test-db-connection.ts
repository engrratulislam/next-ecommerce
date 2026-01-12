/**
 * Database Connection Test Script
 * 
 * This script tests the MongoDB connection and displays the results.
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

import connectDB, { getConnectionStatus, isConnected } from "../src/lib/db";
import mongoose from "mongoose";

async function testConnection() {
  console.log("\n🔍 Testing MongoDB Connection...\n");
  console.log("=" .repeat(50));

  // Check environment variable
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL not found in environment variables");
    console.log("\nPlease ensure .env.local exists with DATABASE_URL set");
    process.exit(1);
  }

  // Mask credentials in output
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`📋 Connection String: ${maskedUrl}`);
  console.log("");

  try {
    // Attempt connection
    console.log("⏳ Connecting to MongoDB...");
    const connection = await connectDB();

    // Get connection status
    const status = getConnectionStatus();
    const db = connection.connection.db;

    console.log("\n✅ Connection Successful!\n");
    console.log("📊 Connection Details:");
    console.log(`   Database Name: ${db.databaseName}`);
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Port: ${connection.connection.port}`);
    console.log(`   Ready State: ${status.readyStateText} (${status.readyState})`);
    console.log(`   Is Connected: ${isConnected() ? "Yes" : "No"}`);

    // List collections
    try {
      const collections = await db.listCollections().toArray();
      console.log(`\n📁 Collections (${collections.length}):`);
      if (collections.length > 0) {
        collections.forEach((col) => {
          console.log(`   - ${col.name}`);
        });
      } else {
        console.log("   (No collections found - database is empty)");
      }
    } catch (err) {
      console.log("\n⚠️  Could not list collections:", err instanceof Error ? err.message : String(err));
    }

    // Test a simple operation
    try {
      const adminDb = connection.connection.db.admin();
      const serverStatus = await adminDb.command({ serverStatus: 1 });
      console.log(`\n🖥️  Server Info:`);
      console.log(`   Version: ${serverStatus.version || "Unknown"}`);
      console.log(`   Uptime: ${serverStatus.uptime || 0} seconds`);
    } catch (err) {
      console.log("\n⚠️  Could not fetch server status:", err instanceof Error ? err.message : String(err));
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests passed! Database connection is working properly.\n");

    // Close connection
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection Failed!\n");
    console.error("Error Details:");
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}`);
      console.error(`   Name: ${error.name}`);
      if (error.stack && process.env.NODE_ENV === "development") {
        console.error(`   Stack: ${error.stack}`);
      }
    } else {
      console.error(`   Error: ${String(error)}`);
    }

    console.log("\n💡 Troubleshooting Tips:");
    console.log("   1. Ensure MongoDB is running: sudo systemctl status mongod");
    console.log("   2. Check if port 27017 is accessible");
    console.log("   3. Verify DATABASE_URL in .env.local is correct");
    console.log("   4. Check MongoDB logs: /var/log/mongodb/mongod.log");
    console.log("\n" + "=".repeat(50));
    process.exit(1);
  }
}

// Run the test
testConnection();
