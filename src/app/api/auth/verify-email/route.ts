import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification token is required",
        },
        { status: 400 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "your-secret-key"
      ) as { userId: string; email: string };
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification token",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email already verified",
        },
        { status: 200 }
      );
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully. You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
