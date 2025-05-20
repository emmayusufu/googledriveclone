import { createAuthHandler } from "@/lib/apiHelpers";
import {
  successResponse,
  errorResponse,
  validationError,
} from "@/lib/apiResponse";
import { z } from "zod";
import File from "@/models/File";
import Folder from "@/models/Folder";

const RenameSchema = z.object({
  id: z.string().nonempty("ID is required"),
  name: z.string().nonempty("Name is required").max(255, "Name is too long"),
  type: z.enum(["file", "folder"]),
});

const patchHandler = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  try {
    const data = await request.json();

    try {
      const { id, name, type } = RenameSchema.parse(data);

      if (type === "file") {
        const file = await File.findOne({ _id: id, userId });

        if (!file) {
          return errorResponse("File not found", 404);
        }

        file.name = name;
        await file.save();

        return successResponse({ updated: true, item: file });
      } else {
        const folder = await Folder.findOne({ _id: id, userId });

        if (!folder) {
          return errorResponse("Folder not found", 404);
        }

        folder.name = name;
        await folder.save();

        return successResponse({ updated: true, item: folder });
      }
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
    console.error("Error renaming item:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to rename item"
    );
  }
};

export const PATCH = createAuthHandler(patchHandler);
