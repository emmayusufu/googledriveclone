export interface FileItem {
  _id: string;
  name: string;
  userId: string;
  size: number;
  mimeType: string;
  extension?: string;
  cloudinaryPublicId: string;
  url: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  _id: string;
  name: string;
  userId: string;
  parentId: string | null;
  cloudinaryPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeNode {
  _id: string;
  parentId: string | null;
  name: string;
  children: FolderTreeNode[];
}

export type ItemType = "file" | "folder";

export type DriveItem =
  | (FileItem & { type: "file" })
  | (FolderItem & { type: "folder" });

export interface MoveItem {
  id: string;
  type: ItemType;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  errors: Record<string, string[]>;
}

export type FailureResponse = ErrorResponse | ValidationErrorResponse;

export type ApiResponse<T> = SuccessResponse<T> | FailureResponse;
