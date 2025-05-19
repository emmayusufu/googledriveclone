import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Folder from "@/models/Folder";
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

  // Get folder ID from URL
  const url = new URL(req.url);
  const folderId = url.searchParams.get("id");

  if (!folderId) {
    return NextResponse.json(
      { error: "Folder ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the folder
    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Recursive function to delete folder contents
    async function deleteFolderContents(folderId: string) {
      // Delete all files in the folder
      const files = await File.find({ parentId: folderId });

      for (const file of files) {
        if (file.cloudinaryPublicId) {
          // Delete file from Cloudinary
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

        // Delete file document
        await File.deleteOne({ _id: file._id });
      }

      // Find all subfolders
      const subfolders = await Folder.find({ parentId: folderId });

      // Delete contents of each subfolder recursively
      for (const subfolder of subfolders) {
        await deleteFolderContents(subfolder._id);

        // Delete the subfolder itself
        await Folder.deleteOne({ _id: subfolder._id });
      }
    }

    // Delete all contents of the folder
    await deleteFolderContents(folderId);

    // Delete the folder from Cloudinary
    if (folder.cloudinaryPath) {
      await new Promise((resolve, reject) => {
        cloudinary.api.delete_folder(folder.cloudinaryPath, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    }

    // Delete the folder document
    await Folder.deleteOne({ _id: folderId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Error deleting folder" },
      { status: 500 }
    );
  }
}
