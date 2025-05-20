import { ApiResponse, FileItem, FolderItem } from "@/app/types";

export const apiService = {
  getFolderContents: async (
    parentId?: string | null
  ): Promise<
    ApiResponse<{
      folders: FolderItem[];
      files: FileItem[];
    }>
  > => {
    const url = new URL("/api/folders", window.location.origin);
    if (parentId) url.searchParams.append("parentId", parentId);
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch folder contents");
    return response.json();
  },

  getFolderTree: async (): Promise<
    ApiResponse<{
      tree: Array<FolderItem & { children: FolderItem[] }>;
    }>
  > => {
    const response = await fetch("/api/folders/tree");
    if (!response.ok) throw new Error("Failed to fetch folder tree");
    return response.json();
  },

  createFolder: async (name: string, parentId?: string | null) => {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    if (!response.ok) throw new Error("Failed to create folder");
    return response.json();
  },

  getFolderPath: async (
    folderId: string
  ): Promise<
    ApiResponse<{
      path: Array<FolderItem>;
    }>
  > => {
    const url = new URL(
      `/api/folders/${folderId}/path`,
      window.location.origin
    );
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch folder path");
    return response.json();
  },

  deleteFolder: async (id: string) => {
    const url = new URL("/api/folders", window.location.origin);
    url.searchParams.append("id", id);
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete folder");
    return response.json();
  },

  uploadFiles: async (
    files: File[],
    folderId?: string,
    onProgress?: (percentComplete: number) => void
  ) => {
    const totalFiles = files.length;
    let filesProcessed = 0;

    const uploadPromises = Array.from(files).map(async (file, index) => {
      const singleFileFormData = new FormData();
      singleFileFormData.append("files", file);

      if (folderId) {
        singleFileFormData.append("parentId", folderId);
      }

      singleFileFormData.append("totalFiles", totalFiles.toString());
      singleFileFormData.append("fileIndex", index.toString());

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const fileProgress = event.loaded / event.total;

              const overallProgress =
                (filesProcessed / totalFiles + fileProgress / totalFiles) * 100;

              onProgress(Math.min(Math.round(overallProgress), 99));
            }
          });
        }

        xhr.open("POST", "/api/files");

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              filesProcessed++;

              if (onProgress) {
                const overallProgress = (filesProcessed / totalFiles) * 100;
                onProgress(Math.min(Math.round(overallProgress), 99));
              }

              resolve(response);
            } catch {
              reject(new Error("Invalid response format"));
            }
          } else {
            if (xhr.status === 413) {
              reject(new Error(`File size exceeds server limit: ${file.name}`));
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    errorData.error || `Upload failed for file: ${file.name}`
                  )
                );
              } catch {
                reject(
                  new Error(
                    `Upload failed with status ${xhr.status} for file: ${file.name}`
                  )
                );
              }
            }
          }
        };

        xhr.onerror = () => {
          reject(
            new Error(`Network error during upload of file: ${file.name}`)
          );
        };

        xhr.ontimeout = () => {
          reject(new Error(`Upload timed out for file: ${file.name}`));
        };

        xhr.timeout = 120000;

        xhr.send(singleFileFormData);
      });
    });

    try {
      const results = await Promise.all(uploadPromises);

      if (onProgress) {
        onProgress(100);
      }

      const allFiles = results.flat();
      return { files: allFiles };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  deleteFile: async (id: string) => {
    const url = new URL("/api/files", window.location.origin);
    url.searchParams.append("id", id);
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete file");
    return response.json();
  },

  searchFiles: async (
    query: string
  ): Promise<
    ApiResponse<{
      folders: FolderItem[];
      files: FileItem[];
    }>
  > => {
    const url = new URL("/api/files", window.location.origin);
    url.searchParams.append("q", query);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to search files");
    return response.json();
  },

  renameItem: async (id: string, name: string, type: "file" | "folder") => {
    const response = await fetch("/api/rename", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, type }),
    });
    if (!response.ok) throw new Error("Failed to rename item");
    return response.json();
  },
};
