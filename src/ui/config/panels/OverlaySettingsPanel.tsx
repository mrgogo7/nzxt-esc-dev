// Overlay settings panel component
//
// FAZ-5.C2: Overlay UI with element list.
// This panel provides:
// - Enable/disable toggle
// - Overlay element list with z-order controls
// - Delete element functionality
// - Add TEXT overlay button

import React from 'react';
import { useTranslation } from '../../../i18n';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { OverlayElement } from '../../../core/overlay/overlay.types';
import { getOverlayElementLabel } from '../overlay/overlayListHelpers';

interface OverlaySettingsPanelProps {
  /**
   * Whether overlay is enabled.
   * undefined means overlay doesn't exist yet.
   */
  overlayEnabled?: boolean;
  /**
   * Array of overlay elements (for list display).
   */
  elements: OverlayElement[];
  /**
   * Currently selected overlay element ID (UI-only, not persisted).
   */
  selectedElementId?: string | null;
  /**
   * Whether overlay can be toggled (always true in C1).
   */
  canToggle?: boolean;
  /**
   * Whether "Add Text Overlay" button should be enabled.
   * Disabled when element count reaches 20.
   */
  canAddElement: boolean;
  /**
   * Callback when overlay enabled state is toggled.
   */
  onToggleEnabled: () => void;
  /**
   * Callback when "Add Text Overlay" button is clicked.
   */
  onAddTextOverlay: () => void;
  /**
   * Callback when "Add Shape Overlay" button is clicked.
   */
  onAddShapeOverlay?: () => void;
  /**
   * Callback when an element is selected from the list.
   */
  onElementSelect?: (elementId: string | null) => void;
  /**
   * Callback when an element is moved up in z-order.
   */
  onElementMoveUp?: (elementIndex: number) => void;
  /**
   * Callback when an element is moved down in z-order.
   */
  onElementMoveDown?: (elementIndex: number) => void;
  /**
   * Callback when an element is deleted.
   */
  onElementDelete?: (elementIndex: number) => void;
  /**
   * FAZ-5.E1.4: Background preview controls (UI-only, not persisted)
   */
  showBackground?: boolean;
  backgroundOpacity?: number;
  onShowBackgroundChange?: (show: boolean) => void;
  onBackgroundOpacityChange?: (opacity: number) => void;
}

export function OverlaySettingsPanel({
  overlayEnabled = false,
  elements = [],
  selectedElementId = null,
  canToggle = true,
  canAddElement,
  onToggleEnabled,
  onAddTextOverlay,
  onAddShapeOverlay,
  onElementSelect,
  onElementMoveUp,
  onElementMoveDown,
  onElementDelete,
  showBackground = true,
  backgroundOpacity = 1.0,
  onShowBackgroundChange,
  onBackgroundOpacityChange,
}: OverlaySettingsPanelProps): JSX.Element {
  const { t } = useTranslation();
  const elementCount = elements.length;

  return (
    <div className="background-settings-panel">
      <div className="background-settings-panel-header">
        <h2 className="background-settings-panel-title">Overlay</h2>
        <p
          className="background-settings-panel-description"
          style={{
            fontSize: '12px',
            color: '#a0a0a0',
            marginTop: '4px',
            marginBottom: '16px',
          }}
        >
          Overlay elements appear above the background.
        </p>
      </div>

      <div className="background-settings-panel-content">
        {/* Enable/Disable Toggle */}
        <div className="background-settings-panel-row">
          <label className="background-settings-panel-label">
            Enable Overlay
          </label>
          <input
            type="checkbox"
            checked={overlayEnabled}
            onChange={onToggleEnabled}
            disabled={!canToggle}
            style={{
              width: '18px',
              height: '18px',
              cursor: canToggle ? 'pointer' : 'not-allowed',
            }}
          />
        </div>

        {/* FAZ-5.E1.4: Show Background Control */}
        <div className="background-settings-panel-row">
          <label className="background-settings-panel-label">
            Show Background
          </label>
          <input
            type="checkbox"
            checked={showBackground}
            onChange={(e) => {
              if (onShowBackgroundChange) {
                onShowBackgroundChange(e.target.checked);
              }
            }}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* FAZ-5.E1.4: Background Opacity Control (only visible when Show Background is checked) */}
        {showBackground && onBackgroundOpacityChange && (
          <div className="background-settings-panel-row">
            <label className="background-settings-panel-label">
              Opacity
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={backgroundOpacity}
                onChange={(e) => onBackgroundOpacityChange(parseFloat(e.target.value))}
                style={{
                  width: '100px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ minWidth: '35px', textAlign: 'right', fontSize: '11px', color: '#a0a0a0' }}>
                {Math.round(backgroundOpacity * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* FAZ-5.C2: Overlay Element List */}
        {elementCount > 0 && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #2a2a2f',
            }}
          >
            <div className="background-settings-panel-row" style={{ marginBottom: '12px' }}>
              <label className="background-settings-panel-label">
                Overlay Elements ({elementCount})
              </label>
            </div>

            {/* Element List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {elements.map((element, index) => {
                const isSelected = selectedElementId === element.id;
                const isFirst = index === 0;
                const isLast = index === elements.length - 1;
                const label = getOverlayElementLabel(element);

                return (
                  <div
                    key={element.id}
                    className="overlay-element-list-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease, border-color 0.12s ease',
                    }}
                    onClick={() => {
                      if (onElementSelect) {
                        onElementSelect(element.id);
                      }
                    }}
                  >
                    {/* Element Label */}
                    <div
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        color: isSelected ? '#e5e5ea' : '#a0a0a0',
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {label}
                    </div>

                    {/* Z-Order Controls */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="overlay-element-control-button"
                        onClick={() => {
                          if (onElementMoveUp && !isLast) {
                            onElementMoveUp(index);
                          }
                        }}
                        disabled={isLast}
                        style={{
                          padding: '2px',
                          background: 'transparent',
                          border: 'none',
                          color: isLast ? '#666666' : '#a0a0a0',
                          cursor: isLast ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Move up (front)"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="overlay-element-control-button"
                        onClick={() => {
                          if (onElementMoveDown && !isFirst) {
                            onElementMoveDown(index);
                          }
                        }}
                        disabled={isFirst}
                        style={{
                          padding: '2px',
                          background: 'transparent',
                          border: 'none',
                          color: isFirst ? '#666666' : '#a0a0a0',
                          cursor: isFirst ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Move down (back)"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="overlay-element-control-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onElementDelete) {
                          onElementDelete(index);
                        }
                      }}
                      style={{
                        padding: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: '#f97373',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete element"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Overlay Buttons */}
        <div className="background-settings-panel-row" style={{ marginTop: elementCount > 0 ? '16px' : '0' }}>
          <label className="background-settings-panel-label">
            {elementCount === 0 ? 'Overlay Elements' : ''}
          </label>
          <div className="background-settings-panel-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="background-settings-panel-button background-settings-panel-button-primary"
              onClick={onAddTextOverlay}
              disabled={!canAddElement}
              style={{
                opacity: canAddElement ? 1 : 0.5,
                cursor: canAddElement ? 'pointer' : 'not-allowed',
              }}
            >
              Add Text Overlay
            </button>
            {onAddShapeOverlay && (
              <button
                type="button"
                className="background-settings-panel-button background-settings-panel-button-primary"
                onClick={onAddShapeOverlay}
                disabled={!canAddElement}
                style={{
                  opacity: canAddElement ? 1 : 0.5,
                  cursor: canAddElement ? 'pointer' : 'not-allowed',
                }}
              >
                Add Shape Overlay
              </button>
            )}
          </div>
          {!canAddElement && elementCount >= 20 && (
            <div
              style={{
                fontSize: '11px',
                color: '#ff6b6b',
                marginTop: '4px',
              }}
            >
              Maximum 20 overlay elements reached
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

