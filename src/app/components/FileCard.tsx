import React from "react";
interface FileCardProps {
  file: any;
  userId: string;
}
export function FileCard({ file, userId }: FileCardProps) {
  const base = `/uploads/${userId}/${file.parentId || ""}`;
  const src = `${base}/${file._id}${file.extension}`;
  if (file.mimeType.startsWith("image/")) {
    return <img src={src} alt={file.name} className="max-w-xs rounded" />;
  }
  if (file.mimeType.startsWith("video/")) {
    return <video src={src} controls className="max-w-xs" />;
  }
  if (file.mimeType === "application/pdf") {
    return (
      <object data={src} type="application/pdf" width="400" height="300">
        PDF Preview
      </object>
    );
  }
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      {file.name}
    </a>
  );
}
