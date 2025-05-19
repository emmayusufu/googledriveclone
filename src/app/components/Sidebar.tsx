import { FolderIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  currentFolder: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export default function Sidebar({
  currentFolder,
  onNavigateToFolder,
  onFileUpload,
  isMobileSidebarOpen = true,
  onCloseMobileSidebar,
}: SidebarProps) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static fixed inset-y-0 left-0 z-30 w-64 md:w-[20vw]`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between md:hidden mb-4">
          <h1>My Drive</h1>
          {onCloseMobileSidebar && (
            <button
              onClick={onCloseMobileSidebar}
              className="text-gray-500 cursor-pointer p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="fileUpload" className="w-full">
            <div className="bg-white text-blue-600 border border-gray-300 rounded-sm px-4 py-2 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center text-[13px]">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                Upload files
              </div>
            </div>
            <input
              id="fileUpload"
              type="file"
              multiple
              onChange={onFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigateToFolder(null)}
              className={`flex items-center px-3 py-2 w-full rounded-md text-sm cursor-pointer ${
                currentFolder === null
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderIcon className="w-5 h-5 mr-3" />
              My Drive
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
