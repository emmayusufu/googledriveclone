import React from "react";
import { FileSystemItem, formatFileSize } from "../utils/fileSystem";
import ItemIcon from "./ItemIcon";

interface ItemsListProps {
  items: FileSystemItem[];
  viewMode: "grid" | "list";
  selectedItem: string | null;
  onItemClick: (item: FileSystemItem) => void;
  onItemContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
}

const ItemsList: React.FC<ItemsListProps> = ({
  items,
  viewMode,
  selectedItem,
  onItemClick,
  onItemContextMenu,
}) => {
  if (items.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-gray-500">This folder is empty</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          : "space-y-1"
      }`}
    >
      {items.map((item) =>
        viewMode === "grid" ? (
          // Grid View
          <div
            key={item.id}
            className={`group rounded-lg border hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden ${
              selectedItem === item.id
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200"
            }`}
            onClick={() => onItemClick(item)}
            onContextMenu={(e) => onItemContextMenu(e, item)}
          >
            <div className="flex flex-col items-center p-3">
              <ItemIcon type={item.type} fileType={item.fileType} />
              <p className="mt-2 text-sm text-gray-800 truncate w-full text-center">
                {item.name}
              </p>
              {item.type === "file" && item.size && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(item.size)}
                </p>
              )}
            </div>
          </div>
        ) : (
          // List View
          <div
            key={item.id}
            className={`flex items-center px-3 py-2 rounded-md cursor-pointer group hover:bg-gray-50 ${
              selectedItem === item.id ? "bg-blue-50" : ""
            }`}
            onClick={() => onItemClick(item)}
            onContextMenu={(e) => onItemContextMenu(e, item)}
          >
            <div className="w-10 flex-shrink-0">
              <ItemIcon type={item.type} fileType={item.fileType} />
            </div>
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-medium text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Modified {item.modifiedAt.toLocaleDateString()}
              </p>
            </div>
            {item.type === "file" && item.size && (
              <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                {formatFileSize(item.size)}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ItemsList;
