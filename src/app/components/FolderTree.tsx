import { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
} from "@heroicons/react/20/solid";
import { FolderItem } from "../types";

type FolderTreeNode = FolderItem & { children: FolderTreeNode[] };

interface FolderTreeProps {
  folders: FolderTreeNode[];
  currentFolder: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  level?: number;
}

const FolderTree = ({
  folders,
  currentFolder,
  onNavigateToFolder,
  level = 0,
}: FolderTreeProps) => {
  return (
    <ul className="space-y-1">
      {folders.map((folder) => (
        <FolderTreeNodeComponent
          key={folder._id}
          folder={folder}
          currentFolder={currentFolder}
          onNavigateToFolder={onNavigateToFolder}
          level={level}
        />
      ))}
    </ul>
  );
};

interface FolderTreeNodeProps {
  folder: FolderTreeNode;
  currentFolder: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  level: number;
}

const FolderTreeNodeComponent = ({
  folder,
  currentFolder,
  onNavigateToFolder,
  level,
}: FolderTreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = folder.children.length > 0;

  return (
    <li className="relative">
      <div
        className={`flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer ${
          currentFolder === folder._id.toString()
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onNavigateToFolder(folder._id.toString())}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-1 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 mr-1" />
        )}
        <FolderIcon className="w-4 h-4 mr-2" />
        <span className="truncate">{folder.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <FolderTree
          folders={folder.children}
          currentFolder={currentFolder}
          onNavigateToFolder={onNavigateToFolder}
          level={level + 1}
        />
      )}
    </li>
  );
};

export default FolderTree;
