/**
 * Database Health Check API Route
 * 
 * GET /api/health/db
 * 
 * Returns the status of MongoDB connection.
 * Useful for monitoring and health checks.
 */

import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db-test";

export async function GET() {
  try {
    const result = await testConnection();

    if (result.success) {
      return NextResponse.json(
        {
          status: "healthy",
          database: "connected",
          ...result.details,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: result.details?.error,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
