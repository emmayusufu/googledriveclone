import { useCallback, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

export function DragDropUpload({ parentId }: { parentId?: string }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    if (parentId) formData.append("parentId", parentId);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    window.location.reload();
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
    setIsDragging(false);
  }, []);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <ArrowUpTrayIcon className="w-12 h-12 text-gray-400" />
        <p className="text-gray-600">
          Drag and drop files here, or{" "}
          <label className="text-blue-600 cursor-pointer hover:underline">
            browse your device
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-sm text-gray-500">Supports: images, videos, PDFs</p>
      </div>
    </div>
  );
}
