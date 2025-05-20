import { createAuthHandler } from "@/lib/apiHelpers";
import Folder from "@/models/Folder";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { FolderTreeNode } from "@/app/types";

export const GET = createAuthHandler(async ({ userId }) => {
  try {
    const allFolders = await Folder.find({
      userId,
    })
      .select("_id parentId name")
      .lean<Pick<FolderTreeNode, "_id" | "parentId" | "name">[]>();

    const byParent = allFolders.reduce<Record<string, typeof allFolders>>(
      (acc, folder) => {
        const pid = folder.parentId ?? "root";
        (acc[pid] ||= []).push(folder);
        return acc;
      },
      {}
    );

    const buildTree = (pid = "root"): FolderTreeNode[] =>
      (byParent[pid] || []).map((f) => ({
        _id: f._id.toString(),
        parentId: f.parentId,
        name: f.name,
        children: buildTree(f._id.toString()),
      }));

    const tree = buildTree();
    return successResponse({ tree });
  } catch (error) {
    console.error("Error fetching folder tree:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch folder tree"
    );
  }
});
