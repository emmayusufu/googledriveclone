import React from "react";
import { FolderIcon, DocumentIcon } from "@heroicons/react/24/outline";

interface ItemIconProps {
  type: "file" | "folder";
  fileType?: string;
  size?: "sm" | "md" | "lg";
}

const ItemIcon: React.FC<ItemIconProps> = ({
  type,
  fileType = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const iconSize = sizeClasses[size];

  if (type === "folder") {
    return <FolderIcon className={`${iconSize} text-yellow-500`} />;
  }

  if (fileType?.startsWith("image/")) {
    return (
      <div
        className={`${iconSize} rounded flex items-center justify-center bg-blue-100 text-blue-500`}
      >
        <span className="text-xs font-medium">IMG</span>
      </div>
    );
  }

  if (fileType?.startsWith("video/")) {
    return (
      <div
        className={`${iconSize} rounded flex items-center justify-center bg-red-100 text-red-500`}
      >
        <span className="text-xs font-medium">VID</span>
      </div>
    );
  }

  if (fileType?.startsWith("audio/")) {
    return (
      <div
        className={`${iconSize} rounded flex items-center justify-center bg-purple-100 text-purple-500`}
      >
        <span className="text-xs font-medium">AUD</span>
      </div>
    );
  }

  if (fileType?.includes("pdf")) {
    return (
      <div
        className={`${iconSize} rounded flex items-center justify-center bg-red-100 text-red-500`}
      >
        <span className="text-xs font-medium">PDF</span>
      </div>
    );
  }

  if (
    fileType?.includes("document") ||
    fileType?.includes("sheet") ||
    fileType?.includes("presentation")
  ) {
    return (
      <div
        className={`${iconSize} rounded flex items-center justify-center bg-green-100 text-green-500`}
      >
        <span className="text-xs font-medium">DOC</span>
      </div>
    );
  }

  return <DocumentIcon className={`${iconSize} text-blue-500`} />;
};

export default ItemIcon;
