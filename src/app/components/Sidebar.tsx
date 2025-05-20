"use client";
import { useEffect, useState } from "react";
import { FolderIcon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FolderItem } from "../types";
import { apiService } from "@/lib/api";
import FolderTree from "./FolderTree";

type FolderTreeNode = FolderItem & { children: FolderTreeNode[] };

function normalizeFolderTree(
  folders: Array<FolderItem & { children?: FolderItem[] }>
): FolderTreeNode[] {
  return folders.map((folder) => ({
    ...folder,
    children: normalizeFolderTree(folder.children || []),
  }));
}

interface SidebarProps {
  currentFolder: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  isMobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export default function Sidebar({
  currentFolder,
  onNavigateToFolder,
  isMobileSidebarOpen = true,
  onCloseMobileSidebar,
}: SidebarProps) {
  const [folderTree, setFolderTree] = useState<
    Array<FolderItem & { children?: FolderItem[] }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchFolderTree = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFolderTree();
      if (response.success && response.data) {
        setFolderTree(response.data.tree);
      }
    } catch (error) {
      console.error("Failed to fetch folder tree:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderTree();
  }, []);

  useEffect(() => {
    const eventTypes = [
      "folder-created",
      "folder-deleted",
      "folder-renamed",
      "folder-moved",
      "file-uploaded",
    ];

    const handleFolderChange = () => {
      fetchFolderTree();
    };

    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, handleFolderChange);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, handleFolderChange);
      });
    };
  }, []);

  return (
    <aside
      className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static fixed inset-y-0 left-0 z-30 w-64 md:w-[20vw]`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1>My Drive</h1>
          {onCloseMobileSidebar && (
            <button
              onClick={onCloseMobileSidebar}
              className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigateToFolder(null)}
              className={`flex items-center px-3 py-2 w-full rounded-md text-sm cursor-pointer ${
                currentFolder === null
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderIcon className="w-5 h-5 mr-3" />
              My Drive
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-sm text-gray-500">Loading folders...</div>
        ) : (
          <FolderTree
            folders={normalizeFolderTree(folderTree)}
            currentFolder={currentFolder}
            onNavigateToFolder={onNavigateToFolder}
          />
        )}
      </div>
    </aside>
  );
}
