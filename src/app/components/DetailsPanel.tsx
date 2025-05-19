import { XMarkIcon } from "@heroicons/react/20/solid";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import FilePreview from "./FilePreview";
import ItemIcon from "./ItemIcon";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  parent: string | null;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
  content?: string | ArrayBuffer | null;
  fileType?: string;
}

interface DetailsPanelProps {
  item: FileSystemItem;
  onClose: () => void;
  onRename: (item: FileSystemItem) => void;
  onDelete: (itemId: string) => void;
  items: FileSystemItem[];
}

export default function DetailsPanel({
  item,
  onClose,
  onRename,
  onDelete,
  items,
}: DetailsPanelProps) {
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

  // Get parent folder name
  const getParentName = () => {
    if (!item.parent) return "My Drive";
    const parent = items.find((i) => i.id === item.parent);
    return parent ? parent.name : "Unknown";
  };

  return (
    <aside className="w-72 border-l border-gray-200 bg-white p-4 overflow-y-auto">
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
        <ItemIcon type={item.type} fileType={item.fileType} />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-gray-700">Name</h3>
          <p className="mt-1 text-xs text-gray-900">{item.name}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Type</h3>
          <p className="mt-1 text-xs text-gray-900">
            {item.type === "folder" ? "Folder" : item.fileType || "File"}
          </p>
        </div>

        {item.type === "file" && item.size && (
          <div>
            <h3 className="text-xs font-medium text-gray-700">Size</h3>
            <p className="mt-1 text-xs text-gray-900">
              {formatSize(item.size)}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-medium text-gray-700">Location</h3>
          <p className="mt-1 text-xs text-gray-900">{getParentName()}</p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Created</h3>
          <p className="mt-1 text-xs text-gray-900">
            {item.createdAt.toLocaleDateString()}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700">Modified</h3>
          <p className="mt-1 text-xs text-gray-900">
            {item.modifiedAt.toLocaleDateString()}
          </p>
        </div>

        <div className="pt-2 flex space-x-2">
          <Button onClick={() => onRename(item)} variant="secondary">
            <PencilIcon className="w-4 h-4 mr-1" />
            Rename
          </Button>

          <Button onClick={() => onDelete(item.id)} variant="danger">
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </aside>
  );
}
