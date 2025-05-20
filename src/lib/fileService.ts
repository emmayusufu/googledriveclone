import File from "@/models/File";
import { uploadFile, deleteFile } from "./cloudinary";
import { connectToDatabase } from "./db";
import { NotFoundError } from "./errors";

export async function uploadFiles(
  userId: string,
  files: File[],
  parentId: string | null
) {
  await connectToDatabase();
  const savedFiles: never[] = [];

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFile(buffer, {
        userId,
        parentId,
        fileName: file.name,
        mimeType: file.type,
      });

      if (!result) throw new Error("File upload failed");

      const fileDoc = await File.create({
        name: file.name,
        parentId,
        userId,
        size: buffer.byteLength,
        mimeType: file.type,
        extension: file.name.split(".").pop(),
        url: result.secure_url,
        cloudinaryPublicId: result.public_id,
      });

      if (fileDoc) {
        savedFiles.push(fileDoc as never);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${file.name}`);
    }
  }

  return savedFiles;
}

export async function deleteUserFile(userId: string, fileId: string) {
  await connectToDatabase();

  const file = await File.findOne({ _id: fileId, userId });
  if (!file) throw new NotFoundError("File");

  if (file.cloudinaryPublicId) {
    await deleteFile(file.cloudinaryPublicId);
  }

  await File.deleteOne({ _id: fileId });

  return true;
}

export async function searchFiles(userId: string, query: string) {
  await connectToDatabase();

  if (!query || query.trim() === "") {
    return [];
  }

  const searchRegex = new RegExp(query, "i");

  return File.find({
    userId,
    name: searchRegex,
  })
    .sort({ updatedAt: -1 })
    .limit(50);
}
