import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload/image - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ecommerce-products",
      resource_type: "image",
    });

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
