import Folder from "@/models/Folder";
import File from "@/models/File";
import { createFolder, deleteFolder, deleteFile } from "./cloudinary";
import { connectToDatabase } from "./db";
import { NotFoundError } from "./errors";

export async function createUserFolder(
  userId: string,
  name: string,
  parentId: string | null
) {
  await connectToDatabase();

  const folderDoc = await Folder.create({
    name,
    parentId,
    userId,
  });

  const cloudinaryPath = await createFolder(
    userId,
    folderDoc._id.toString(),
    parentId
  );

  folderDoc.cloudinaryPath = cloudinaryPath;
  await folderDoc.save();

  return folderDoc;
}

export async function deleteUserFolder(userId: string, folderId: string) {
  await connectToDatabase();

  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) throw new NotFoundError("Folder");

  await deleteFolderContents(folderId);

  if (folder.cloudinaryPath) {
    await deleteFolder(folder.cloudinaryPath);
  }

  await Folder.deleteOne({ _id: folderId });

  return true;
}

async function deleteFolderContents(folderId: string) {
  const files = await File.find({ parentId: folderId });
  for (const file of files) {
    if (file.cloudinaryPublicId) {
      await deleteFile(file.cloudinaryPublicId);
    }
    await File.deleteOne({ _id: file._id });
  }

  const subfolders = await Folder.find({ parentId: folderId });
  for (const subfolder of subfolders) {
    await deleteFolderContents(subfolder._id.toString());
    await Folder.deleteOne({ _id: subfolder._id });
  }
}
