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
} from "@heroicons/react/24/outline";
import Breadcrumb from "./components/Breadcrumb";
import Button from "./components/Button";
import ContextMenu from "./components/ContextMenu";
import ItemIcon from "./components/ItemIcon";
import Modal from "./components/Modal";
import Input from "./components/Input";
import DetailsPanel from "./components/DetailsPanel";
import Sidebar from "./components/Sidebar";

// Types
type ItemType = "file" | "folder";

interface FileSystemItem {
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

// Main App Component
export default function DriveApp() {
  // State
  const [items, setItems] = useState<FileSystemItem[]>([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      parent: null,
      createdAt: new Date("2025-01-15"),
      modifiedAt: new Date("2025-01-15"),
    },
    {
      id: "2",
      name: "Images",
      type: "folder",
      parent: null,
      createdAt: new Date("2025-02-01"),
      modifiedAt: new Date("2025-02-01"),
    },
    {
      id: "3",
      name: "Project Proposal.pdf",
      type: "file",
      parent: null,
      size: 1024 * 1024 * 2.5, // 2.5 MB
      createdAt: new Date("2025-04-10"),
      modifiedAt: new Date("2025-04-10"),
      fileType: "application/pdf",
    },
    {
      id: "4",
      name: "Meeting Notes.txt",
      type: "file",
      parent: null,
      size: 1024 * 15, // 15 KB
      createdAt: new Date("2025-05-05"),
      modifiedAt: new Date("2025-05-05"),
      fileType: "text/plain",
    },
    {
      id: "5",
      name: "Quarterly Reports",
      type: "folder",
      parent: "1",
      createdAt: new Date("2025-03-15"),
      modifiedAt: new Date("2025-03-15"),
    },
    {
      id: "6",
      name: "Q1 Report.xlsx",
      type: "file",
      parent: "5",
      size: 1024 * 1024 * 1.2, // 1.2 MB
      createdAt: new Date("2025-03-15"),
      modifiedAt: new Date("2025-03-15"),
      fileType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    {
      id: "7",
      name: "Profile Photo.jpg",
      type: "file",
      parent: "2",
      size: 1024 * 1024 * 3.1, // 3.1 MB
      createdAt: new Date("2025-02-20"),
      modifiedAt: new Date("2025-02-20"),
      fileType: "image/jpeg",
    },
  ]);

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FileSystemItem;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbPath, setBreadcrumbPath] = useState<FileSystemItem[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Adjust details visibility based on screen size
  useEffect(() => {
    if (windowWidth < 768) {
      setIsDetailsVisible(false);
    } else {
      setIsDetailsVisible(true);
    }
  }, [windowWidth]);

  // Close mobile sidebar when navigation occurs
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentFolder]);

  // Modals
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");

  // Get current folder path for breadcrumbs
  useEffect(() => {
    if (!currentFolder) {
      setBreadcrumbPath([]);
      return;
    }

    const path: FileSystemItem[] = [];
    let parent: string | null = currentFolder;

    while (parent) {
      const folder = items.find((item) => item.id === parent);
      if (folder) {
        path.unshift(folder);
        parent = folder.parent;
      } else {
        break;
      }
    }

    setBreadcrumbPath(path);
  }, [currentFolder, items]);

  // Filter items based on current folder and search query
  const filteredItems = items.filter((item) => {
    // Filter by folder
    const inCurrentFolder = item.parent === currentFolder;

    // Filter by search query
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return inCurrentFolder && matchesSearch;
  });

  // Get details of selected item
  const selectedItemDetails = items.find((item) => item.id === selectedItem);

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Navigate to folder
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
    setSelectedItem(null);
    setShowDetails(false);
  };

  // Handle item selection
  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === "folder") {
      navigateToFolder(item.id);
    } else {
      setSelectedItem(item.id);
      setShowDetails(true);

      // On mobile, show details panel by default
      if (windowWidth < 768) {
        setIsDetailsVisible(true);
      }
    }
  };

  // Handle item context menu
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setSelectedItem(item.id);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const newFile: FileSystemItem = {
          id: generateId(),
          name: file.name,
          type: "file",
          parent: currentFolder,
          size: file.size,
          createdAt: new Date(),
          modifiedAt: new Date(),
          content: reader.result,
          fileType: file.type,
        };

        setItems((prev) => [...prev, newFile]);
      };

      reader.readAsArrayBuffer(file);
    });

    // Reset file input
    e.target.value = "";
  };

  // Create new folder
  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: FileSystemItem = {
      id: generateId(),
      name: newFolderName.trim(),
      type: "folder",
      parent: currentFolder,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setItems((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowCreateFolderModal(false);
  };

  // Rename item
  const renameItem = () => {
    if (!renameValue.trim() || !selectedItem) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem
          ? { ...item, name: renameValue.trim(), modifiedAt: new Date() }
          : item
      )
    );

    setRenameValue("");
    setShowRenameModal(false);
  };

  // Handle rename item from details panel
  const handleRenameFromDetails = (item: FileSystemItem) => {
    setRenameValue(item.name);
    setShowRenameModal(true);
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    // Find all child items to delete (for folders)
    const itemsToDelete = [itemId];

    const findChildItems = (parentId: string) => {
      const children = items.filter((item) => item.parent === parentId);

      children.forEach((child) => {
        itemsToDelete.push(child.id);
        if (child.type === "folder") {
          findChildItems(child.id);
        }
      });
    };

    const itemToDelete = items.find((item) => item.id === itemId);
    if (itemToDelete && itemToDelete.type === "folder") {
      findChildItems(itemId);
    }

    // Remove all items
    setItems((prev) => prev.filter((item) => !itemsToDelete.includes(item.id)));

    // Clear selection if deleted
    if (selectedItem === itemId) {
      setSelectedItem(null);
      setShowDetails(false);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Toggle details panel on mobile
  const toggleDetailsPanel = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-full cursor-pointer hover:bg-gray-100"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl text-gray-800">My Drive</h1>
          </div>

          <div className="relative max-w-xs w-full hidden sm:block">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in Drive"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border text-xs border-gray-300 rounded-sm hover:border-blue-400 focus:border-blue-500 focus:outline-[0.5px] w-full"
            />
          </div>
        </div>

        {/* Mobile Search - Below header */}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          currentFolder={currentFolder}
          onNavigateToFolder={navigateToFolder}
          onFileUpload={handleFileUpload}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-auto p-4 md:p-6 ${
            showDetails && isDetailsVisible && selectedItemDetails
              ? "md:pr-80" // Make space for details panel on desktop
              : ""
          }`}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center">
              {currentFolder && (
                <button
                  onClick={() => {
                    const parentItem = items.find(
                      (item) => item.id === currentFolder
                    );
                    navigateToFolder(parentItem?.parent || null);
                  }}
                  className="mr-2 p-1 rounded-full hover:bg-gray-200"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}

              <Breadcrumb path={breadcrumbPath} onNavigate={navigateToFolder} />
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

              <Button
                onClick={() => setShowCreateFolderModal(true)}
                variant="secondary"
                className="ml-2"
              >
                <FolderPlusIcon className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">New Folder</span>
              </Button>

              {/* Mobile toggle for details panel */}
              {showDetails && selectedItemDetails && windowWidth < 768 && (
                <Button onClick={toggleDetailsPanel} variant="secondary">
                  {isDetailsVisible ? "Hide Details" : "Show Details"}
                </Button>
              )}
            </div>
          </div>

          {/* Items Display */}
          <div
            className={`mt-4 ${
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
                : "space-y-1"
            }`}
          >
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No items found</p>
              </div>
            ) : (
              filteredItems.map((item) =>
                viewMode === "grid" ? (
                  // Grid View
                  <div
                    key={item.id}
                    className={`group rounded-lg border hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden ${
                      selectedItem === item.id
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleItemClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <div className="flex flex-col items-center p-3">
                      <ItemIcon type={item.type} fileType={item.fileType} />
                      <p className="mt-2 text-sm text-gray-800 truncate w-full text-center">
                        {item.name}
                      </p>
                      {item.type === "file" && item.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatSize(item.size)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // List View
                  <div
                    key={item.id}
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer group hover:bg-gray-50 ${
                      selectedItem === item.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleItemClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <div className="w-10 flex-shrink-0">
                      <ItemIcon type={item.type} fileType={item.fileType} />
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Modified {item.modifiedAt.toLocaleDateString()}
                      </p>
                    </div>
                    {item.type === "file" && item.size && (
                      <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                        {formatSize(item.size)}
                      </div>
                    )}
                  </div>
                )
              )
            )}
          </div>
        </main>

        {/* Details Panel */}
        {showDetails && selectedItemDetails && isDetailsVisible && (
          <div
            className={`fixed inset-y-0 right-0 z-40 md:z-0 w-full sm:w-80 transform transition-transform duration-300 ${
              isDetailsVisible ? "translate-x-0" : "translate-x-full"
            } md:relative md:translate-x-0`}
          >
            <DetailsPanel
              item={selectedItemDetails}
              items={items}
              onClose={() => {
                if (windowWidth < 768) {
                  setIsDetailsVisible(false);
                } else {
                  setShowDetails(false);
                }
              }}
              onRename={handleRenameFromDetails}
              onDelete={deleteItem}
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
              onClick: () => deleteItem(contextMenu.item.id),
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
            >
              Cancel
            </Button>
            <Button onClick={createFolder}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Item"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="newName"
              className="block text-sm font-medium text-gray-700"
            >
              New Name
            </label>
            <input
              type="text"
              id="newName"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setShowRenameModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={renameItem}>Rename</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
