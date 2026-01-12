/**
 * Database Connection Test Script (JavaScript version)
 * 
 * Run with: node scripts/test-db-connection.js
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

async function testConnection() {
  console.log("\n🔍 Testing MongoDB Connection...\n");
  console.log("=".repeat(50));

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
    console.log("⏳ Connecting to MongoDB...");
    
    const connection = await mongoose.connect(dbUrl, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const db = connection.connection.db;
    const status = connection.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
      99: "uninitialized",
    };

    console.log("\n✅ Connection Successful!\n");
    console.log("📊 Connection Details:");
    console.log(`   Database Name: ${db.databaseName}`);
    console.log(`   Host: ${connection.connection.host}`);
    console.log(`   Port: ${connection.connection.port}`);
    console.log(`   Ready State: ${states[status] || "unknown"} (${status})`);
    console.log(`   Is Connected: ${status === 1 ? "Yes" : "No"}`);

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
      console.log("\n⚠️  Could not list collections:", err.message);
    }

    // Test a simple operation
    try {
      const adminDb = db.admin();
      const serverStatus = await adminDb.command({ serverStatus: 1 });
      console.log(`\n🖥️  Server Info:`);
      console.log(`   Version: ${serverStatus.version || "Unknown"}`);
      console.log(`   Uptime: ${Math.floor((serverStatus.uptime || 0) / 60)} minutes`);
    } catch (err) {
      console.log("\n⚠️  Could not fetch server status:", err.message);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests passed! Database connection is working properly.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection Failed!\n");
    console.error("Error Details:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Name: ${error.name}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
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

testConnection();
