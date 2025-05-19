import React from "react";
import { DocumentIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { FileSystemItem } from "../utils/fileSystem";

interface FilePreviewProps {
  file: FileSystemItem;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  if (!file) return null;

  if (file.fileType?.startsWith("image/")) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {file.content ? (
          <Image
            src={URL.createObjectURL(
              new Blob([file.content as ArrayBuffer], { type: file.fileType })
            )}
            alt={file.name}
            className="max-h-full object-contain"
            fill
            style={{ objectFit: "contain" }}
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500 text-sm">Image preview unavailable</p>
          </div>
        )}
      </div>
    );
  }

  if (file.fileType?.startsWith("video/")) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {file.content ? (
          <video controls className="max-h-full w-full">
            <source
              src={URL.createObjectURL(
                new Blob([file.content as ArrayBuffer], { type: file.fileType })
              )}
              type={file.fileType}
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500">Video preview unavailable</p>
          </div>
        )}
      </div>
    );
  }

  if (file.fileType?.includes("pdf")) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        <div className="text-center p-6">
          <DocumentIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-gray-500">PDF preview</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full aspect-video flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
      <div className="text-center p-6">
        <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No preview available</p>
        <p className="text-sm text-gray-400 mt-1">
          {file.fileType || "Unknown file type"}
        </p>
      </div>
    </div>
  );
};

export default FilePreview;
