import { deleteUserFile, searchFiles, uploadFiles } from "@/lib/fileService";
import { z } from "zod";
import { validateRequest, createAuthHandler } from "@/lib/apiHelpers";
import {
  successResponse,
  errorResponse,
  validationError,
} from "@/lib/apiResponse";

const UploadSchema = z.object({
  parentId: z.string().optional().nullable(),
});

const DeleteSchema = z.object({
  id: z.string(),
});

const SearchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

const getHandler = async ({
  userId,
  request,
}: {
  userId: string;
  request: Request;
}) => {
  try {
    const { q } = await validateRequest(SearchSchema)(request);

    const files = await searchFiles(userId, q);

    return successResponse({ files });
  } catch (error) {
    if (error instanceof Error && error.message === "Validation failed") {
      return errorResponse("Please provide a search query", 400);
    }
    return errorResponse(
      error instanceof Error ? error.message : "Search failed"
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
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const parentId = formData.get("parentId") as string | null;

    try {
      UploadSchema.parse({ parentId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = Object.fromEntries(
          Object.entries(error.flatten().fieldErrors).filter(
            ([, v]) => v !== undefined
          ) as [string, string[]][]
        );
        return validationError(fieldErrors);
      }
      return errorResponse("Validation failed");
    }

    if (!files.length) {
      return errorResponse("No files uploaded", 400);
    }

    const savedFiles = await uploadFiles(userId, files, parentId);

    return successResponse({ files: savedFiles }, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Upload failed"
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

    await deleteUserFile(userId, id);

    return successResponse({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Error deleting file"
    );
  }
};

export const GET = createAuthHandler(getHandler);
export const POST = createAuthHandler(postHandler);
export const DELETE = createAuthHandler(deleteHandler);
