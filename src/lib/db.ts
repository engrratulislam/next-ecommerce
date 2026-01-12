import mongoose from "mongoose";

/**
 * MongoDB Connection Utility
 * 
 * Provides a singleton connection to MongoDB with proper error handling,
 * connection caching, and logging following industry best practices.
 * 
 * Features:
 * - Connection pooling and caching for Next.js serverless environment
 * - Comprehensive error handling with detailed logging
 * - Connection state monitoring
 * - Graceful error recovery
 */

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Log levels for structured logging
 */
enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Structured logging utility
 */
function log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...metadata,
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[${timestamp}] [${level}] ${message}`, metadata || "");
  } else {
    // In production, you might want to send logs to a logging service
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}

/**
 * Connects to MongoDB database
 * 
 * Implements connection caching to prevent multiple connections in Next.js
 * serverless environment. Uses singleton pattern with global caching.
 * 
 * @returns Promise resolving to mongoose connection
 * @throws Error if connection fails
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if available
  if (cached.conn) {
    log(LogLevel.DEBUG, "Using cached MongoDB connection", {
      readyState: mongoose.connection.readyState,
    });
    return cached.conn;
  }

  // Create new connection promise if not exists
  if (!cached.promise) {
    log(LogLevel.INFO, "Initializing MongoDB connection", {
      uri: MONGODB_URI?.replace(/\/\/.*@/, "//***:***@"), // Mask credentials in logs
    });

    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        log(LogLevel.INFO, "MongoDB connected successfully", {
          database: mongoose.connection.db?.databaseName,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          readyState: mongoose.connection.readyState,
        });

        // Set up connection event listeners
        mongoose.connection.on("error", (error) => {
          log(LogLevel.ERROR, "MongoDB connection error", {
            error: error.message,
            stack: error.stack,
          });
        });

        mongoose.connection.on("disconnected", () => {
          log(LogLevel.WARN, "MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
          log(LogLevel.INFO, "MongoDB reconnected");
        });

        return mongoose;
      })
      .catch((error) => {
        log(LogLevel.ERROR, "MongoDB connection failed", {
          error: error.message,
          name: error.name,
          code: error.code,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
        cached.promise = null; // Reset promise on error
        throw new Error(
          `Failed to connect to MongoDB: ${error.message}. Please check your DATABASE_URL and ensure MongoDB is running.`
        );
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    log(LogLevel.ERROR, "Failed to establish MongoDB connection", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Disconnects from MongoDB (useful for testing or graceful shutdown)
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    log(LogLevel.INFO, "MongoDB disconnected");
  }
}

/**
 * Checks if MongoDB is connected
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1; // 1 = connected
}

/**
 * Gets MongoDB connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  readyStateText: string;
} {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
    99: "uninitialized",
  };

  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    readyStateText: states[mongoose.connection.readyState as keyof typeof states] || "unknown",
  };
}

export default connectDB;
