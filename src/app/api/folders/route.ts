import { createAuthHandler, validateRequest } from "@/lib//apiHelpers";
import Folder from "@/models/Folder";
import File from "@/models/File";
import { z } from "zod";
import { deleteFile, deleteFolder } from "@/lib/cloudinary";
import {
  errorResponse,
  successResponse,
  validationError,
} from "@/lib/apiResponse";
import { createUserFolder } from "@/lib/folderService";

const QuerySchema = z.object({
  parentId: z.string().optional().nullable(),
});

const DeleteSchema = z.object({
  id: z.string(),
});

const CreateFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(255, "Folder name is too long"),
  parentId: z.string().nullable().optional(),
});

const getHandler = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  try {
    const { parentId } = await validateRequest(QuerySchema)(request);

    const [folders, files] = await Promise.all([
      Folder.find({ userId, parentId: parentId || null }).sort("name"),
      File.find({ userId, parentId: parentId || null }).sort("name"),
    ]);

    return successResponse({ folders, files });
  } catch (error) {
    console.error("Error fetching folders/files:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch data"
    );
  }
};

const postHandler = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  try {
    const data = await request.json();

    try {
      const { name, parentId } = CreateFolderSchema.parse(data);

      const validNameRegex = /^[a-zA-Z0-9\s_.-]+$/;
      if (!validNameRegex.test(name)) {
        return errorResponse("Folder name contains invalid characters", 400);
      }

      const folder = await createUserFolder(userId, name, parentId || null);
      return successResponse({ folder }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = Object.fromEntries(
          Object.entries(error.flatten().fieldErrors).filter(
            ([, v]) => v !== undefined
          ) as [string, string[]][]
        );
        return validationError(fieldErrors);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create folder"
    );
  }
};

const deleteHandler = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  try {
    const { id } = await validateRequest(DeleteSchema)(request);

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return errorResponse("Folder not found", 404);
    }

    async function deleteFolderContents(folderId: string) {
      const [files, subfolders] = await Promise.all([
        File.find({ parentId: folderId }),
        Folder.find({ parentId: folderId }),
      ]);

      await Promise.all([
        ...files.map((file) =>
          file.cloudinaryPublicId
            ? deleteFile(file.cloudinaryPublicId)
            : Promise.resolve()
        ),

        ...subfolders.map((subfolder) =>
          subfolder.cloudinaryPath
            ? deleteFolder(subfolder.cloudinaryPath)
            : Promise.resolve()
        ),

        File.deleteMany({ parentId: folderId }),
        ...subfolders.map((subfolder) => deleteFolderContents(subfolder._id)),
        Folder.deleteMany({ parentId: folderId }),
      ]);
    }

    await deleteFolderContents(id);

    if (folder.cloudinaryPath) {
      await deleteFolder(folder.cloudinaryPath);
    }

    await Folder.deleteOne({ _id: id });

    return successResponse({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to delete folder"
    );
  }
};

export const GET = createAuthHandler(getHandler);
export const POST = createAuthHandler(postHandler);
export const DELETE = createAuthHandler(deleteHandler);
