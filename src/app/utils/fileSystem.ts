import { v4 as uuidv4 } from "uuid";

// Types
export type ItemType = "file" | "folder";

export interface FileSystemItem {
  id: string;
  name: string;
  type: ItemType;
  parent: string | null;
  size?: number; // in bytes
  createdAt: Date;
  modifiedAt: Date;
  content?: string | ArrayBuffer | null;
  fileType?: string;
}

// Format file size to human readable format
export const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Generate a unique ID
export const generateId = (): string => {
  return uuidv4();
};

// Save items to local storage
export const saveItemsToStorage = (items: FileSystemItem[]): void => {
  try {
    localStorage.setItem("driveItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Load items from local storage
export const loadItemsFromStorage = (): FileSystemItem[] => {
  try {
    const storedItems = localStorage.getItem("driveItems");

    if (!storedItems) {
      return getDefaultItems();
    }

    // Parse items and convert date strings back to Date objects
    const parsedItems = JSON.parse(storedItems);
    return parsedItems.map((item: FileSystemItem) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      modifiedAt: new Date(item.modifiedAt),
    }));
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return getDefaultItems();
  }
};

// Get default items for first initialization
export const getDefaultItems = (): FileSystemItem[] => {
  return [
    {
      id: "1",
      name: "Documents",
      type: "folder",
      parent: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      parent: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: "3",
      name: "Project Proposal.pdf",
      type: "file",
      parent: null,
      size: 1024 * 1024 * 2.5, // 2.5 MB
      createdAt: new Date(),
      modifiedAt: new Date(),
      fileType: "application/pdf",
    },
  ];
};

// Get path to an item
export const getItemPath = (
  items: FileSystemItem[],
  itemId: string | null
): FileSystemItem[] => {
  if (!itemId) return [];

  const path: FileSystemItem[] = [];
  let currentId: string | null = itemId;

  while (currentId) {
    const item = items.find((i) => i.id === currentId);
    if (!item) break;

    path.unshift(item);
    currentId = item.parent;
  }

  return path;
};

// Get children of a folder
export const getFolderChildren = (
  items: FileSystemItem[],
  folderId: string | null
): FileSystemItem[] => {
  return items.filter((item) => item.parent === folderId);
};

// Search items by name
export const searchItems = (
  items: FileSystemItem[],
  query: string,
  currentFolder: string | null = null
): FileSystemItem[] => {
  if (!query) {
    return items.filter((item) => item.parent === currentFolder);
  }

  const lowerCaseQuery = query.toLowerCase();

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerCaseQuery) &&
      (currentFolder === null || item.parent === currentFolder)
  );
};

// Get total storage used in bytes
export const getTotalStorageUsed = (items: FileSystemItem[]): number => {
  return items.reduce((total, item) => {
    if (item.type === "file" && item.size) {
      return total + item.size;
    }
    return total;
  }, 0);
};
