import { useEffect, useRef, useState, ReactNode } from "react";

interface ContextMenuAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  actions: ContextMenuAction[];
}

export default function ContextMenu({
  x,
  y,
  onClose,
  actions,
}: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    if (x + menuRect.width > viewportWidth) {
      adjustedX = Math.max(0, viewportWidth - menuRect.width - 10);
    }

    let adjustedY = y;
    if (y + menuRect.height > viewportHeight) {
      adjustedY = Math.max(0, viewportHeight - menuRect.height - 10);
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", onClose);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", onClose);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => {
            if (!action.disabled && !action.loading) {
              action.onClick();
              onClose();
            }
          }}
          disabled={action.disabled || action.loading}
          style={{
            opacity: action.disabled || action.loading ? 0.5 : 1,
            cursor:
              action.disabled || action.loading ? "not-allowed" : "pointer",
          }}
        >
          {action.icon && (
            <span className="mr-2 w-5 h-5">
              {action.loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                action.icon
              )}
            </span>
          )}
          {action.loading ? `${action.label}...` : action.label}
        </button>
      ))}
    </div>
  );
}
