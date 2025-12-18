// Right-side slide-in drawer component
// Reusable drawer pattern based on PresetManagerPanel

import React, { useEffect, useRef } from 'react';

interface DrawerProps {
  /**
   * Whether the drawer is open.
   */
  isOpen: boolean;
  /**
   * Callback invoked when drawer should close.
   */
  onClose: () => void;
  /**
   * Drawer title text.
   */
  title: string;
  /**
   * Drawer content.
   */
  children: React.ReactNode;
}

/**
 * Right-side slide-in drawer component.
 * Opens from the right side of the screen with backdrop.
 * Supports ESC key and click-outside to close.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
}: DrawerProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside panel to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if click is on the backdrop (not on other UI elements)
        const target = e.target as HTMLElement;
        if (target.classList.contains('drawer-backdrop')) {
          onClose();
        }
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Don't render if not open (for performance)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? 'drawer-backdrop-open' : ''}`}
        aria-hidden="true"
      />
      
      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`drawer-panel ${isOpen ? 'drawer-panel-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">
            {title}
          </h2>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
}
