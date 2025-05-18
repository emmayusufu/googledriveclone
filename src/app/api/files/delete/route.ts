import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import File from "@/models/File";
import { auth } from "@clerk/nextjs";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();

  // Get file ID from URL
  const url = new URL(req.url);
  const fileId = url.searchParams.get("id");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  try {
    // Get file document from database
    const file = await File.findOne({ _id: fileId, userId });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (file.cloudinaryPublicId) {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          file.cloudinaryPublicId,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    }

    // Delete file document from database
    await File.deleteOne({ _id: fileId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}
