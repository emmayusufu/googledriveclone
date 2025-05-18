"use client";

import { useRef, useEffect } from "react";
import { Download, Trash2, Share2, Star, Edit, Copy } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  item: File;
  onClose: () => void;
  onDownload: (file: File) => void;
  onDelete: (file: File) => void;
  onRename: (file: File) => void;
}

export default function ContextMenu({
  x,
  y,
  item,
  onClose,
  onDownload,
  onDelete,
  onRename,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white shadow-lg rounded-md py-1 z-50 w-48"
      style={{ top: y, left: x }}
    >
      <button
        onClick={() => {
          onDownload(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Download className="w-4 h-4 mr-3" />
        Download
      </button>
      <button
        onClick={() => {
          onRename(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Edit className="w-4 h-4 mr-3" />
        Rename
      </button>
      <button
        onClick={() => {
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Share2 className="w-4 h-4 mr-3" />
        Share
      </button>
      <button
        onClick={() => {
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Star className="w-4 h-4 mr-3" />
        Add to starred
      </button>
      <button
        onClick={() => {
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Copy className="w-4 h-4 mr-3" />
        Make a copy
      </button>
      <div className="border-t my-1"></div>
      <button
        onClick={() => {
          onDelete(item);
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        <Trash2 className="w-4 h-4 mr-3" />
        Delete
      </button>
    </div>
  );
}
