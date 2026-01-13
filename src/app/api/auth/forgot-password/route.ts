import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
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

    const { email } = validation.data;

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate password reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email, purpose: "password-reset" },
        process.env.NEXTAUTH_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken);
        console.log("Password reset email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Continue and return success to prevent email enumeration
      }
    }

    // Always return success message
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
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
