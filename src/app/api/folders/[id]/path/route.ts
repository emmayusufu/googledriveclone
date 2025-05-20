import { createAuthHandler } from "@/lib/apiHelpers";
import Folder from "@/models/Folder";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { FolderItem } from "@/app/types";

export const GET = createAuthHandler(async ({ userId, request }) => {
  try {
    const id = request.url.split("/").slice(-2)[0];

    const path: Array<FolderItem> = [];
    let currentId = id;

    while (currentId) {
      const folder = await Folder.findOne({ _id: currentId, userId });
      if (!folder) break;

      path.unshift(folder);

      currentId = folder.parentId;
    }

    return successResponse({ path });
  } catch (error) {
    console.error("Error fetching folder path:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch folder path"
    );
  }
});
