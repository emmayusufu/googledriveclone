"use client";

import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PresentationChartBarIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { FileItem } from "../types";

import "@cyntler/react-doc-viewer/dist/index.css";

const DocViewerComponent = dynamic(
  () =>
    import("@cyntler/react-doc-viewer").then((mod) => {
      const { default: DocViewer, DocViewerRenderers } = mod;
      const WrappedDocViewer = (
        props: React.ComponentProps<typeof DocViewer>
      ) => (
        <DocViewer
          {...props}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableHeader: true,
              disableFileName: true,
            },
          }}
        />
      );
      WrappedDocViewer.displayName = "WrappedDocViewer";
      return WrappedDocViewer;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-pulse text-gray-400">Loading preview...</div>
      </div>
    ),
  }
);

interface FilePreviewProps {
  file: FileItem;
  className?: string;
}

export default function FilePreview({
  file,
  className = "",
}: FilePreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getFileCategory = () => {
    if (!file.mimeType) return "unknown";
    const type = file.mimeType.toLowerCase();
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (type === "application/pdf") return "pdf";
    if (
      [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "text/plain",
      ].includes(type)
    )
      return "doc";

    if (type.includes("zip") || type.includes("compressed")) return "archive";
    return "unknown";
  };

  const renderPreview = () => {
    const category = getFileCategory();

    if (!file.url) return renderGenericIcon();

    try {
      switch (category) {
        case "image":
          return (
            <div className="relative w-full h-64">
              <Image
                src={file.url}
                alt={file.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          );

        case "video":
          return (
            <video src={file.url} controls className="max-w-full max-h-full">
              Your browser does not support the video tag.
            </video>
          );

        case "audio":
          return (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <MusicalNoteIcon className="h-12 w-12 text-blue-500 mb-4" />
              <audio src={file.url} controls className="w-full max-w-xs">
                Your browser does not support the audio tag.
              </audio>
            </div>
          );

        case "pdf":
        case "doc":
          return (
            mounted && (
              <DocViewerComponent
                documents={[{ uri: file.url, fileName: file.name }]}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                  },
                }}
              />
            )
          );

        default:
          return renderGenericIcon();
      }
    } catch (error) {
      console.error("Error rendering preview:", error);
      return renderGenericIcon();
    }
  };

  const renderGenericIcon = () => {
    const category = getFileCategory();

    const iconMap = {
      image: { Icon: PhotoIcon, color: "text-green-500" },
      video: { Icon: VideoCameraIcon, color: "text-red-500" },
      audio: { Icon: MusicalNoteIcon, color: "text-blue-500" },
      pdf: { Icon: DocumentTextIcon, color: "text-yellow-500" },
      doc: { Icon: DocumentTextIcon, color: "text-yellow-500" },
      text: { Icon: CodeBracketIcon, color: "text-gray-500" },
      presentation: {
        Icon: PresentationChartBarIcon,
        color: "text-orange-500",
      },
      spreadsheet: { Icon: DocumentTextIcon, color: "text-green-600" },
      archive: { Icon: ArchiveBoxIcon, color: "text-gray-600" },
      unknown: { Icon: DocumentIcon, color: "text-gray-400" },
    };

    const { Icon, color } = iconMap[category] || iconMap.unknown;

    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Icon className={`h-16 w-16 ${color}`} />
        <p className="mt-2 text-sm text-gray-700 text-center truncate w-full">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 text-center">
          {file.mimeType || "Unknown file type"}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`flex items-center justify-center w-full h-full min-h-[200px] ${className}`}
    >
      {renderPreview()}
    </div>
  );
}
