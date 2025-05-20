import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import FilePreview from "./FilePreview";
import ItemIcon from "./ItemIcon";
import { DriveItem } from "../types";

interface DetailsPanelProps {
  item: DriveItem;
  onClose: () => void;
  onRename: (item: DriveItem) => void;
  onDelete: (itemId: string) => void;
  items: DriveItem[];
  isLoading?: boolean;
}

export default function DetailsPanel({
  item,
  onClose,
  onRename,
  onDelete,
  items,
  isLoading = false,
}: DetailsPanelProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getParentName = () => {
    if (!item.parentId) return "My Drive";
    const parent = items.find((i) => i._id === item.parentId);
    return parent ? parent.name : "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRename = async () => {
    setIsRenaming(true);
    try {
      await onRename(item);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item._id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <aside className="w-full sm:w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading details...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full sm:w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer hover:bg-gray-100 rounded-full"
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {item.type === "file" && (
        <div className="mb-4">
          <FilePreview file={item} />
        </div>
      )}

      <div className="flex items-center justify-center mb-4">
        <ItemIcon
          type={item.type}
          fileType={item.type === "file" ? item.mimeType : undefined}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-gray-700">Name</h3>
          <p className="mt-1 text-sm text-gray-900">{item.name}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Type</h3>
          <p className="mt-1 text-sm text-gray-900">
            {item.type === "folder"
              ? "Folder"
              : item.type === "file"
              ? item.mimeType || "File"
              : "File"}
          </p>
        </div>

        {item.type === "file" && item.size && (
          <div>
            <h3 className="text-xs font-medium text-gray-700">Size</h3>
            <p className="mt-1 text-sm text-gray-900">
              {formatSize(item.size)}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-medium text-gray-700">Location</h3>
          <p className="mt-1 text-sm text-gray-900">{getParentName()}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Created</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(item.createdAt)}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Modified</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(item.updatedAt)}
          </p>
        </div>

        <div className="pt-2 flex space-x-2">
          <Button
            onClick={handleRename}
            variant="secondary"
            loading={isRenaming}
            disabled={isRenaming || isDeleting}
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Rename
          </Button>

          <Button
            onClick={handleDelete}
            variant="danger"
            loading={isDeleting}
            disabled={isRenaming || isDeleting}
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </aside>
  );
}
