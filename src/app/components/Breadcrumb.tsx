import React from "react";

type Folder = {
  id: string;
  name: string;
};

type BreadcrumbProps = {
  path: Folder[];
  onNavigate: (folderId: string | null) => void;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className={`text-gray-600 hover:text-gray-900 cursor-pointer`}
      >
        My Drive
      </button>

      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        return (
          <div key={folder.id} className="flex items-center">
            <span className="mx-1 text-gray-400">/</span>
            {isLast ? (
              <span className="text-gray-900 font-medium">{folder.name}</span>
            ) : (
              <button
                onClick={() => onNavigate(folder.id)}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                {folder.name}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
