import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/newsletter/subscribe - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await connectDB();

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      if ((existing as any).isActive) {
        return NextResponse.json(
          { success: false, error: "Email already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        (existing as any).isActive = true;
        await existing.save();
        return NextResponse.json(
          {
            success: true,
            message: "Subscription reactivated successfully",
          },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await Newsletter.create({ email: email.toLowerCase() });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to subscribe",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
