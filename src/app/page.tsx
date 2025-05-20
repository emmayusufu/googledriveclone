"use client";
import { useState, useEffect } from "react";
import {
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "./components/Breadcrumb";
import Button from "./components/Button";
import ContextMenu from "./components/ContextMenu";
import ItemIcon from "./components/ItemIcon";
import Modal from "./components/Modal";
import Input from "./components/Input";
import DetailsPanel from "./components/DetailsPanel";
import Sidebar from "./components/Sidebar";
import { DriveItem, FileItem, FolderItem } from "./types";
import { apiService } from "@/lib/api";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { EyeIcon } from "@heroicons/react/20/solid";
import PreviewModal from "./components/PreviewModal";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { formatSize } from "@/lib/utils";
import {
  MAX_UPLOAD_SIZE,
  MAX_UPLOAD_SIZE_READABLE,
  MAX_TOTAL_UPLOAD_SIZE,
  MAX_TOTAL_UPLOAD_SIZE_READABLE,
} from "@/lib/constants";

export default function DriveApp() {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: DriveItem;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DriveItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderItem[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const dispatchFolderEvent = (eventType: string) => {
    const event = new Event(eventType);
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (windowWidth < 768) {
      setIsDetailsVisible(false);
    } else {
      setIsDetailsVisible(true);
    }
  }, [windowWidth]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentFolder]);

  useEffect(() => {
    loadFolderContents();
  }, [currentFolder]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiService.searchFiles(searchQuery);

        if (res.success) {
          const results = res.data;

          const formattedResults: DriveItem[] = [
            ...(results.files || []).map((file: FileItem) => ({
              ...file,
              type: "file" as const,
            })),
            ...(results.folders || []).map((folder: FolderItem) => ({
              ...folder,
              type: "folder" as const,
            })),
          ];
          setSearchResults(formattedResults);
        } else {
          setError(res.error);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError("Search failed");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    buildBreadcrumbPath();
  }, [currentFolder, items]);

  const loadFolderContents = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.getFolderContents(currentFolder);

      if (res.success) {
        const formattedItems: DriveItem[] = [
          ...res.data.files.map((file) => ({
            ...file,
            type: "file" as const,
          })),
          ...res.data.folders.map((folder) => ({
            ...folder,
            type: "folder" as const,
          })),
        ];

        setItems(formattedItems);
      } else {
        console.error("API Error:", res.error);
        setError(res.error);
      }
    } catch (err) {
      console.error("Failed to load folder contents:", err);
      setError("Failed to load folder contents");
    } finally {
      setLoading(false);
    }
  };

  const buildBreadcrumbPath = async () => {
    try {
      if (!currentFolder) {
        setBreadcrumbPath([]);
        return;
      }

      const response = await apiService.getFolderPath(currentFolder);

      if (!response.success) {
        setError(response.error);
        return;
      }
      const path = response.data.path;

      setBreadcrumbPath(path);
    } catch (err) {
      console.error("Failed to build breadcrumb path:", err);
      setBreadcrumbPath([]);
    }
  };

  const displayItems = searchQuery.trim() ? searchResults : items;

  const selectedItemDetails = displayItems.find(
    (item) => item._id === selectedItem
  );

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
    setSelectedItem(null);
    setShowDetails(false);
    setSearchQuery("");
  };

  const handleItemClick = (
    item: DriveItem,
    action: "open" | "details" | "preview" = "open"
  ) => {
    setSelectedItem(item._id);

    if (action === "open") {
      if (item.type === "folder") {
        navigateToFolder(item._id);
      } else {
        setPreviewFile(item);
      }
    } else if (action === "details") {
      setShowDetails(true);
      if (windowWidth < 768) {
        setIsDetailsVisible(true);
      }
    } else if (action === "preview") {
      if (item.type === "file") {
        setPreviewFile(item);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: DriveItem) => {
    e.preventDefault();
    setSelectedItem(item._id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > MAX_UPLOAD_SIZE
    );

    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles
        .map((file) => `${file.name} (${formatSize(file.size)})`)
        .join(", ");

      setError(
        `The following files exceed the maximum upload size of ${MAX_UPLOAD_SIZE_READABLE}: ${fileList}`
      );
      e.target.value = "";
      return;
    }

    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    if (totalSize > MAX_TOTAL_UPLOAD_SIZE) {
      setError(
        `Total upload size (${formatSize(
          totalSize
        )}) exceeds the maximum batch upload limit of ${MAX_TOTAL_UPLOAD_SIZE_READABLE}`
      );
      e.target.value = "";
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      await apiService.uploadFiles(
        Array.from(files),
        currentFolder ?? undefined,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      await loadFolderContents();
      dispatchFolderEvent("file-uploaded");
    } catch (err) {
      console.error("Failed to upload files:", err);
      setError(
        `Failed to upload files: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }

    e.target.value = "";
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      await apiService.createFolder(
        newFolderName.trim(),
        currentFolder ?? undefined
      );
      await loadFolderContents();
      setNewFolderName("");
      setShowCreateFolderModal(false);
      dispatchFolderEvent("folder-created");
    } catch (err) {
      console.error("Failed to create folder:", err);
      setError("Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const renameItem = async () => {
    if (!renameValue.trim() || !selectedItem) return;

    const item = displayItems.find((item) => item._id === selectedItem);
    if (!item) return;

    setIsRenaming(true);
    try {
      await apiService.renameItem(selectedItem, renameValue.trim(), item.type);
      await loadFolderContents();
      setRenameValue("");
      setShowRenameModal(false);
      if (item.type === "folder") {
        dispatchFolderEvent("folder-renamed");
      }
    } catch (err) {
      console.error("Failed to rename item:", err);
      setError("Failed to rename item");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleRenameFromDetails = (item: DriveItem) => {
    setRenameValue(item.name);
    setShowRenameModal(true);
  };

  const deleteItem = async (itemId: string) => {
    const item = displayItems.find((item) => item._id === itemId);
    if (!item) return;

    setIsDeleting(true);
    try {
      if (item.type === "folder") {
        await apiService.deleteFolder(itemId);
      } else {
        await apiService.deleteFile(itemId);
      }

      await loadFolderContents();

      if (selectedItem === itemId) {
        setSelectedItem(null);
        setShowDetails(false);
      }
      dispatchFolderEvent("folder-deleted");
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDetailsPanel = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

  const getDateFromString = (dateString: string) => {
    return new Date(dateString);
  };

  const renderUploadButton = () => (
    <div className="relative">
      <label
        htmlFor="file-upload"
        className={`flex items-center justify-center rounded-sm font-[400] transition-colors focus:ring-offset-2 cursor-pointer px-3 py-2 text-xs ${
          isUploading
            ? "bg-gray-100 text-gray-500"
            : "bg-white text-gray-700 hover:bg-gray-50"
        } border border-gray-300 group relative`}
        title={`Maximum file size: ${MAX_UPLOAD_SIZE_READABLE} per file, ${MAX_TOTAL_UPLOAD_SIZE_READABLE} total`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          multiple
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        ) : (
          <ArrowUpTrayIcon className="w-5 h-5 text-gray-600 mr-1" />
        )}
        <span className="hidden sm:inline">
          {isUploading
            ? `Uploading ${Math.round(uploadProgress)}%`
            : "Upload Files"}
        </span>
      </label>

      {isUploading && (
        <div className="absolute left-0 bottom-0 h-1 bg-blue-100 w-full rounded-b-sm overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-full cursor-pointer hover:bg-gray-100"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl text-gray-800">Google Drive Clone</h1>
          </div>
          <div className="relative max-w-xs w-full hidden sm:block">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 border text-xs border-gray-300 rounded-sm hover:border-blue-400 focus:border-blue-500 focus:outline-[0.5px] w-full"
            />

            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}

            {searchQuery.length && !isSearching ? (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            ) : null}
          </div>

          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
        </div>

        <div className="sm:hidden mt-2">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-600">
              <span className="sr-only">Dismiss</span>
            </button>

            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 cursor-pointer p-2 hover:bg-red-100 rounded-full"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <Sidebar
          currentFolder={currentFolder}
          onNavigateToFolder={navigateToFolder}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-200">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center">
              {!searchQuery && currentFolder && (
                <button
                  onClick={() => {
                    const currentFolderItem =
                      breadcrumbPath[breadcrumbPath.length - 1];
                    navigateToFolder(currentFolderItem?.parentId || null);
                  }}
                  className="mr-2 p-1 rounded-full hover:bg-gray-200"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}

              {searchQuery ? (
                <div className="text-sm text-gray-600">
                  Search results for &quot;{searchQuery}&quot; (
                  {searchResults.length} items)
                </div>
              ) : (
                <Breadcrumb
                  path={breadcrumbPath}
                  onNavigate={navigateToFolder}
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-md ${
                  viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                <Squares2X2Icon className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-md ${
                  viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                <ListBulletIcon className="w-5 h-5 text-gray-600" />
              </button>

              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateFolderModal(true)}
                  variant="secondary"
                  className="ml-2"
                  loading={loading}
                >
                  <FolderPlusIcon className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">New Folder</span>
                </Button>
              )}

              {!searchQuery && renderUploadButton()}
              {showDetails && selectedItemDetails && windowWidth < 768 && (
                <Button onClick={toggleDetailsPanel} variant="secondary">
                  {isDetailsVisible ? "Hide Details" : "Show Details"}
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          )}

          {!loading && (
            <div
              className={`mt-4 ${
                viewMode === "grid"
                  ? `grid grid-cols-2 sm:grid-cols-3 ${
                      showDetails && isDetailsVisible
                        ? "md:grid-cols-3 lg:grid-cols-4"
                        : "md:grid-cols-4 lg:grid-cols-6"
                    } gap-3 md:gap-4`
                  : "space-y-1"
              }`}
            >
              {displayItems.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No search results found" : "No items found"}
                  </p>
                </div>
              ) : (
                displayItems.map((item) =>
                  viewMode === "grid" ? (
                    <div
                      key={item._id}
                      className={`group relative rounded-lg border hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden ${
                        selectedItem === item._id
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleItemClick(item, "open")}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                    >
                      <div className="flex flex-col items-center p-3">
                        <ItemIcon
                          type={item.type}
                          fileType={
                            item.type === "file" ? item.mimeType : undefined
                          }
                        />
                        <p className="mt-2 text-sm text-gray-800 truncate w-full text-center">
                          {item.name}
                        </p>
                        {item.type === "file" && item.size && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatSize(item.size)}
                          </p>
                        )}
                      </div>

                      <button
                        className="absolute top-1 right-1 p-1 rounded-full cursor-pointer group-hover:opacity-100 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, item);
                        }}
                      >
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div
                      key={item._id}
                      className={`flex items-center px-3 py-2 rounded-md cursor-pointer group hover:bg-gray-50 ${
                        selectedItem === item._id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleItemClick(item)}
                      onContextMenu={(e) => handleContextMenu(e, item)}
                    >
                      <div className="w-10 flex-shrink-0">
                        <ItemIcon
                          type={item.type}
                          fileType={
                            item.type === "file" ? item.mimeType : undefined
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Modified{" "}
                          {getDateFromString(
                            item.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {item.type === "file" && item.size && (
                        <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                          {formatSize(item.size)}
                        </div>
                      )}

                      <button
                        className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, item);
                        }}
                      >
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </main>

        {showDetails && selectedItemDetails && isDetailsVisible && (
          <div
            className={`fixed inset-y-0 right-0 z-40 md:z-0 w-full sm:w-80 transform transition-transform duration-300 ${
              isDetailsVisible ? "translate-x-0" : "translate-x-full"
            } md:relative md:translate-x-0`}
          >
            <DetailsPanel
              item={selectedItemDetails}
              items={displayItems}
              onClose={() => {
                if (windowWidth < 768) {
                  setIsDetailsVisible(false);
                } else {
                  setShowDetails(false);
                }
              }}
              onRename={handleRenameFromDetails}
              onDelete={(itemId) => deleteItem(itemId)}
              isLoading={loading}
            />
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            {
              label: "Open",
              icon: <ArrowUpTrayIcon className="w-5 h-5" />,
              onClick: () => handleItemClick(contextMenu.item),
            },
            ...(contextMenu.item.type === "file"
              ? [
                  {
                    label: "Preview",
                    icon: <EyeIcon className="w-5 h-5" />,
                    onClick: () => handleItemClick(contextMenu.item, "preview"),
                  },
                  {
                    label: "Details",
                    icon: <InformationCircleIcon className="w-5 h-5" />,
                    onClick: () => handleItemClick(contextMenu.item, "details"),
                  },
                ]
              : []),
            {
              label: "Rename",
              icon: <PencilIcon className="w-5 h-5" />,
              onClick: () => {
                setRenameValue(contextMenu.item.name);
                setShowRenameModal(true);
              },
            },
            {
              label: "Delete",
              icon: <TrashIcon className="w-5 h-5" />,
              onClick: () => deleteItem(contextMenu.item._id),
              disabled: isDeleting,
              loading: isDeleting && selectedItem === contextMenu.item._id,
            },
          ]}
        />
      )}

      <Modal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        title="Create New Folder"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="Folder Name"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setShowCreateFolderModal(false)}
              variant="secondary"
              disabled={isCreatingFolder}
            >
              Cancel
            </Button>
            <Button
              onClick={createFolder}
              disabled={!newFolderName.trim() || isCreatingFolder}
              loading={isCreatingFolder}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Item"
      >
        <div className="space-y-4">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            autoFocus
            label="New Name"
          />

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setShowRenameModal(false)}
              variant="secondary"
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={renameItem}
              disabled={!renameValue.trim() || isRenaming}
              loading={isRenaming}
            >
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
