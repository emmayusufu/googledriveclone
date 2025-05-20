'use client";';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { FileItem } from "../types";

import "@cyntler/react-doc-viewer/dist/index.css";

const DocViewerComponent = dynamic(
  () =>
    import("@cyntler/react-doc-viewer").then((mod) => {
      const { default: DocViewer, DocViewerRenderers } = mod;
      const WrappedDocViewer = (
        props: React.ComponentProps<typeof DocViewer>
      ) => <DocViewer {...props} pluginRenderers={DocViewerRenderers} />;
      WrappedDocViewer.displayName = "WrappedDocViewer";
      return WrappedDocViewer;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-80 w-full">
        <div className="animate-pulse text-white">
          Loading document viewer...
        </div>
      </div>
    ),
  }
);

interface PreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

export default function PreviewModal({ file, onClose }: PreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const docs = [{ uri: file.url, fileName: file.name }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-transparent rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium text-lg text-white truncate pr-8">
            {file.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white hover:text-gray-200 cursor-pointer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center items-center min-h-[300px]">
            {file.mimeType.startsWith("image/") ? (
              <Image
                src={file.url}
                alt={file.name}
                width={800}
                height={600}
                className="object-contain max-w-full max-h-[60vh]"
                style={{ width: "auto", height: "auto" }}
              />
            ) : file.mimeType.startsWith("video/") ? (
              <video
                src={file.url}
                controls
                className="max-w-full max-h-[60vh]"
              />
            ) : file.mimeType.startsWith("audio/") ? (
              <audio src={file.url} controls className="w-full" />
            ) : file.mimeType === "application/pdf" ||
              [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "text/csv",
                "text/plain",
              ].includes(file.mimeType) ? (
              mounted && <DocViewerComponent documents={docs} />
            ) : (
              <div className="text-center p-8">
                <p className="text-gray-300 mb-4">
                  Preview not available for this file type
                </p>
                <p className="text-sm text-gray-400">{file.mimeType}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
