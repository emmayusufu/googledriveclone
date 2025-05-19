import React from "react";
import ItemIcon from "./ItemIcon";

type ItemType = "file" | "folder";

type Item = {
  name: string;
  type: ItemType;
  fileType?: string;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
};

type ItemDetailsProps = {
  item: Item | null;
  onClose: () => void;
};

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onClose }) => {
  if (!item) return null;

  const formatSize = (bytes?: number): string => {
    if (!bytes) return "N/A";

    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Details</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <span className="sr-only">Close</span>×
        </button>
      </div>

      <div className="mb-4 flex justify-center">
        <ItemIcon type={item.type} fileType={item.fileType} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-gray-900 font-medium">{item.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="text-gray-900">
            {item.type === "folder" ? "Folder" : item.fileType || "File"}
          </p>
        </div>

        {item.type === "file" && (
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="text-gray-900">{formatSize(item.size)}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Created</p>
          <p className="text-gray-900">{item.createdAt.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Modified</p>
          <p className="text-gray-900">{item.modifiedAt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
