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

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectToDatabase();
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const parentId = (formData.get("parentId") as string) || null;

  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const savedFiles = [];

  for (const file of files) {
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a unique filename using Date.now() and original filename
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

      // Upload to Cloudinary with user folder structure
      const folderPath = parentId ? `${userId}/${parentId}` : userId;

      // Convert buffer to base64 for Cloudinary upload
      const base64Data = buffer.toString("base64");
      const fileType = file.type;

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:${fileType};base64,${base64Data}`,
          {
            folder: `uploads/${folderPath}`,
            public_id: uniqueFileName.split(".")[0], // Remove file extension for public_id
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      // Save metadata to MongoDB
      const fileDoc = await File.create({
        name: file.name,
        parentId: parentId || null,
        userId,
        size: buffer.byteLength,
        mimeType: file.type,
        extension: file.name.split(".").pop(),
        url: (result as any).secure_url,
        cloudinaryPublicId: (result as any).public_id,
      });

      savedFiles.push(fileDoc);
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      return NextResponse.json(
        { error: "Error uploading file" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ files: savedFiles }, { status: 201 });
}
