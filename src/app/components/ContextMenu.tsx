import React, { ReactNode } from "react";

type ContextMenuAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  actions: ContextMenuAction[];
};

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  actions,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 bg-white rounded-md shadow-lg py-1 w-48"
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              action.onClick();
              onClose();
            }}
          >
            {action.icon && <span className="mr-2 w-5 h-5">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ContextMenu;
