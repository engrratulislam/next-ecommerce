import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { token, newPassword } = validation.data;

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "your-secret-key"
      ) as { userId: string; email: string; purpose: string };

      // Verify token purpose
      if (decoded.purpose !== "password-reset") {
        throw new Error("Invalid token purpose");
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Account is deactivated",
        },
        { status: 403 }
      );
    }

    // Update password (will be hashed by User model pre-save hook)
    user.password = newPassword;
    await user.save();

    // TODO: Send password change confirmation email
    // await sendPasswordChangedEmail(user.email);

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
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
