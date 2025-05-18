"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  Trash2,
  Share2,
  Star,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";

interface FilePreviewModalProps {
  file: File | null;
  onClose: () => void;
  onDownload: (file: File) => void;
  onDelete: (file: File) => void;
}

export default function FilePreviewModal({
  file,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(!!file);
  }, [file]);

  if (!isOpen || !file) return null;

  const getFileIcon = () => {
    if (file.type.includes("image")) return <ImageIcon className="w-16 h-16" />;
    if (file.type.includes("video")) return <Video className="w-16 h-16" />;
    if (file.type.includes("audio")) return <Music className="w-16 h-16" />;
    return <FileText className="w-16 h-16" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{file.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onDownload(file)}
              className="p-2 text-gray-600 hover:text-blue-600"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(file)}
              className="p-2 text-gray-600 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {file.type.includes("image") ? (
            <div className="flex justify-center">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {getFileIcon()}
              <p className="mt-4 text-gray-500">
                Preview not available for this file type
              </p>
              <button
                onClick={() => onDownload(file)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="mr-2 w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Uploaded: {new Date(file.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-blue-600">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-yellow-500">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
