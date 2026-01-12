/**
 * Database Connection Test Utility
 * 
 * This utility can be used to test MongoDB connection during development
 * or as a health check endpoint.
 * 
 * Usage:
 * - Import and call testConnection() in a test script
 * - Use in API route for health checks
 */

import connectDB, { getConnectionStatus, isConnected } from "./db";
import mongoose from "mongoose";

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    database?: string;
    host?: string;
    port?: number;
    readyState?: number;
    readyStateText?: string;
    collections?: string[];
    error?: string;
  };
}

/**
 * Tests MongoDB connection and returns detailed results
 * 
 * @returns Promise resolving to connection test result
 */
export async function testConnection(): Promise<ConnectionTestResult> {
  try {
    // Attempt to connect
    const connection = await connectDB();

    // Get connection status
    const status = getConnectionStatus();

    // Get database information
    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);

    return {
      success: true,
      message: "MongoDB connection successful",
      details: {
        database: db.databaseName,
        host: connection.connection.host,
        port: connection.connection.port,
        readyState: status.readyState,
        readyStateText: status.readyStateText,
        collections: collectionNames,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "MongoDB connection failed",
      details: {
        error: error instanceof Error ? error.message : String(error),
        readyState: mongoose.connection.readyState,
        readyStateText: getConnectionStatus().readyStateText,
      },
    };
  }
}

/**
 * Simple connection check (doesn't throw errors)
 * 
 * @returns true if connected, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await connectDB();
    return isConnected();
  } catch {
    return false;
  }
}
