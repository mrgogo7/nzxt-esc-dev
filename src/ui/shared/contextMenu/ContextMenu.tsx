import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import './contextMenu.css';

export interface ContextMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  // Handle outside click with pointerdown (capture phase for reliability)
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to catch events before stopPropagation
    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [onClose]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Optional: Clamp position to keep menu within viewport (edge case safety)
  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const MENU_WIDTH = 180;
    const MENU_HEIGHT = 120;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust if menu goes off right edge
    if (rect.right > viewportWidth - 8) {
      adjustedX = Math.min(x, viewportWidth - MENU_WIDTH - 8);
    }

    // Adjust if menu goes off bottom edge
    if (rect.bottom > viewportHeight - 8) {
      adjustedY = Math.min(y, viewportHeight - MENU_HEIGHT - 8);
    }

    // Ensure menu doesn't go off left or top edge
    if (adjustedX < 8) {
      adjustedX = 8;
    }
    if (adjustedY < 8) {
      adjustedY = 8;
    }

    if (adjustedX !== x || adjustedY !== y) {
      setPosition({ left: adjustedX, top: adjustedY });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="context-menu-item"
          disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
