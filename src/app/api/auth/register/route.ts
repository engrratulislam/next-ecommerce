import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "@/lib/email";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
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
    const validation = registerSchema.safeParse(body);
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

    const { name, email, password } = validation.data;

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already registered",
        },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by User model pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "customer",
      isVerified: false,
      isActive: true,
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: "email-verification" },
      process.env.NEXTAUTH_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log("Verification email sent to:", user.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue registration even if email fails
    }

    // Return success response (without password)
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        verificationToken, // For development/testing only
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
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
