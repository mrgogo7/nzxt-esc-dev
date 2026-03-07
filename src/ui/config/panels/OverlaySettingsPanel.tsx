// Overlay settings panel component
//
// FAZ-5.C2: Overlay UI with element list.
// This panel provides:
// - Enable/disable toggle
// - Overlay element list with z-order controls
// - Delete element functionality
// - Add TEXT overlay button

import { ChevronUp, ChevronDown, Trash2, ChevronRight } from 'lucide-react';
import type { OverlayElement } from '../../../core/overlay/overlay.types';
import type { TextElementConfigComplete } from '../../../core/elements/text/text.types';
import { getOverlayElementLabel } from '../overlay/overlayListHelpers';
import { ColorPicker } from '../../shared/color-picker';
import { Drawer } from '../../shared/drawer';
import '../../shared/drawer/drawer.css';

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
  /**
   * FAZ-6B: Element list collapse state (UI-only, not persisted)
   */
  collapsedElementIds?: Set<string>;
  onToggleElementCollapse?: (elementId: string) => void;
  /**
   * FAZ-6B: Text element input handlers
   */
  onTextElementContentChange?: (elementId: string, content: string) => void;
  onTextElementFontSizeChange?: (elementId: string, fontSize: number) => void;
  onTextElementFontFamilyChange?: (elementId: string, fontFamily: string) => void;
  onTextElementRotateChange?: (elementId: string, rotateDeg: number) => void;
  onTextElementOffsetChange?: (elementId: string, x: number, y: number) => void;
  /**
   * FAZ-6B: Text color drawer state and handlers
   */
  textColorDrawerOpen?: boolean;
  textColorDrawerElementId?: string | null;
  onOpenTextColorDrawer?: (elementId: string) => void;
  onCloseTextColorDrawer?: () => void;
  onTextElementColorChange?: (elementId: string, color: string) => void;
  /**
   * FAZ-6B: Text element outline handler
   */
  onTextElementOutlineChange?: (elementId: string, outlineWidth: number, outlineColor?: string) => void;
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
  collapsedElementIds = new Set<string>(),
  onToggleElementCollapse,
  onTextElementContentChange,
  onTextElementFontSizeChange,
  onTextElementFontFamilyChange,
  onTextElementRotateChange,
  onTextElementOffsetChange,
  textColorDrawerOpen = false,
  textColorDrawerElementId = null,
  onOpenTextColorDrawer,
  onCloseTextColorDrawer,
  onTextElementColorChange,
  onTextElementOutlineChange,
}: OverlaySettingsPanelProps): JSX.Element {
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
                const isCollapsed = collapsedElementIds.has(element.id);

                return (
                  <div
                    key={element.id}
                    className="overlay-element-list-item"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0',
                      backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '4px',
                      transition: 'background-color 0.12s ease, border-color 0.12s ease',
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (onElementSelect) {
                          onElementSelect(element.id);
                        }
                      }}
                    >
                      {/* Collapse Chevron */}
                      {onToggleElementCollapse && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleElementCollapse(element.id);
                          }}
                          style={{
                            padding: '2px',
                            background: 'transparent',
                            border: 'none',
                            color: '#a0a0a0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease',
                            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                          }}
                          title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                          <ChevronRight size={14} />
                        </button>
                      )}

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

                    {/* Card Body (Collapsible) */}
                    {!isCollapsed && element.elementType === 'text' && (
                      <div
                        style={{
                          padding: '12px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          backgroundColor: 'rgba(0, 0, 0, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(() => {
                          const textElement = element as TextElementConfigComplete;
                          return (
                            <>
                              {/* Content Input */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Content
                                </label>
                                <input
                                  type="text"
                                  value={textElement.config.content}
                                  onChange={(e) => {
                                    if (onTextElementContentChange) {
                                      onTextElementContentChange(textElement.id, e.target.value);
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                />
                              </div>

                              {/* Font Size Input */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Font Size (px)
                                </label>
                                <input
                                  type="number"
                                  value={textElement.config.fontSize}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && value > 0 && onTextElementFontSizeChange) {
                                      onTextElementFontSizeChange(textElement.id, value);
                                    }
                                  }}
                                  min={1}
                                  max={200}
                                  step={1}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                />
                              </div>

                              {/* Font Family Select */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Font Family
                                </label>
                                <select
                                  value={textElement.config.fontFamily || 'nzxt-extrabold'}
                                  onChange={(e) => {
                                    if (onTextElementFontFamilyChange) {
                                      onTextElementFontFamilyChange(textElement.id, e.target.value);
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                >
                                  <option value="nzxt-extrabold">NZXT Font</option>
                                </select>
                              </div>

                              {/* Text Color Swatch */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Text Color
                                </label>
                                <button
                                  type="button"
                                  className="background-settings-panel-swatch"
                                  onClick={() => {
                                    if (onOpenTextColorDrawer) {
                                      onOpenTextColorDrawer(textElement.id);
                                    }
                                  }}
                                  style={{
                                    backgroundColor: textElement.config.color || '#FFFFFF',
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  title="Text Color"
                                  aria-label="Text Color"
                                />
                              </div>

                              {/* Rotate Input */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Rotate (deg)
                                </label>
                                <input
                                  type="number"
                                  value={textElement.transform.rotateDeg}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && onTextElementRotateChange) {
                                      onTextElementRotateChange(textElement.id, value);
                                    }
                                  }}
                                  min={-180}
                                  max={180}
                                  step={1}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                />
                              </div>

                              {/* X Offset Input */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  X Offset
                                </label>
                                <input
                                  type="number"
                                  value={textElement.transform.x}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && onTextElementOffsetChange) {
                                      onTextElementOffsetChange(textElement.id, value, textElement.transform.y);
                                    }
                                  }}
                                  min={-3}
                                  max={3}
                                  step={0.01}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                />
                              </div>

                              {/* Y Offset Input */}
                              <div className="background-settings-panel-row">
                                <label className="background-settings-panel-label" style={{ fontSize: '11px' }}>
                                  Y Offset
                                </label>
                                <input
                                  type="number"
                                  value={textElement.transform.y}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && onTextElementOffsetChange) {
                                      onTextElementOffsetChange(textElement.id, textElement.transform.x, value);
                                    }
                                  }}
                                  min={-3}
                                  max={3}
                                  step={0.01}
                                  style={{
                                    flex: 1,
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor: '#1a1a1f',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '4px',
                                    color: '#e5e5ea',
                                  }}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
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

      {/* FAZ-6B: Text Color Drawer */}
      {textColorDrawerElementId && (
        <Drawer
          isOpen={textColorDrawerOpen}
          onClose={onCloseTextColorDrawer || (() => {})}
          title="Text Color"
        >
          {(() => {
            const textElement = elements.find(
              (el) => el.elementType === 'text' && el.id === textColorDrawerElementId
            ) as TextElementConfigComplete | undefined;

            if (!textElement || !onTextElementColorChange) {
              return null;
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Text Color Section */}
                <div>
                  <h3 style={{ fontSize: '14px', color: '#e5e5ea', marginBottom: '12px' }}>Text Color</h3>
                  <ColorPicker
                    value={textElement.config.color || '#FFFFFF'}
                    onChange={(color) => {
                      onTextElementColorChange(textElement.id, color);
                    }}
                    hideInputType={true}
                    hideColorTypeBtns={true}
                    hideGradientType={true}
                    hideGradientAngle={true}
                    hideGradientStop={true}
                    hideGradientControls={true}
                  />
                </div>

                {/* Outline Color Section */}
                <div>
                  <h3 style={{ fontSize: '14px', color: '#e5e5ea', marginBottom: '12px' }}>Outline Color</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Outline Thickness Input */}
                    <div>
                      <label style={{ fontSize: '12px', color: '#a0a0a0', display: 'block', marginBottom: '4px' }}>
                        Outline Thickness (px)
                      </label>
                      <input
                        type="number"
                        value={textElement.config.outlineWidth || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && onTextElementOutlineChange) {
                            // If outlineWidth > 0 and outlineColor is undefined, helper will set default #000000
                            onTextElementOutlineChange(
                              textElement.id,
                              Math.max(0, Math.min(20, value)),
                              textElement.config.outlineColor
                            );
                          }
                        }}
                        min={0}
                        max={20}
                        step={1}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          fontSize: '12px',
                          backgroundColor: '#1a1a1f',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          color: '#e5e5ea',
                        }}
                      />
                    </div>

                    {/* Outline Color Picker */}
                    {textElement.config.outlineWidth && textElement.config.outlineWidth > 0 && (
                      <ColorPicker
                        value={textElement.config.outlineColor || '#000000'}
                        onChange={(color) => {
                          if (onTextElementOutlineChange) {
                            onTextElementOutlineChange(
                              textElement.id,
                              textElement.config.outlineWidth || 0,
                              color
                            );
                          }
                        }}
                        hideInputType={true}
                        hideColorTypeBtns={true}
                        hideGradientType={true}
                        hideGradientAngle={true}
                        hideGradientStop={true}
                        hideGradientControls={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Drawer>
      )}
    </div>
  );
}

