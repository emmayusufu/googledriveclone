import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Folder from "@/models/Folder";
import { auth } from "@clerk/nextjs";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FolderCreateSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();

  const body = await req.json();
  const { name, parentId } = FolderCreateSchema.parse(body);

  try {
    // Create folder document in MongoDB
    const folderDoc = await Folder.create({
      name,
      parentId: parentId || null,
      userId,
    });

    // Determine the folder path in Cloudinary
    let cloudinaryPath = `uploads/${userId}/${folderDoc._id}`;

    // If it has a parent, get the parent path
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        cloudinaryPath = `uploads/${userId}/${parentId}/${folderDoc._id}`;
      }
    }

    // Create folder in Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.api.create_folder(cloudinaryPath, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Update the folder with the Cloudinary path
    folderDoc.cloudinaryPath = cloudinaryPath;
    await folderDoc.save();

    return NextResponse.json({ folder: folderDoc }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Error creating folder" },
      { status: 500 }
    );
  }
}
