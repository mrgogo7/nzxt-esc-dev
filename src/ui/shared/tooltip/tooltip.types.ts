import type React from 'react';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export type TooltipVariant = 'label' | 'description';

export type TooltipContent = string | string[];

export interface TooltipProps {
  /**
   * Tooltip content. Can be a single string or an array of strings
   * (rendered as multiple lines).
   */
  content: TooltipContent;
  /**
   * Tooltip placement around the trigger element.
   * Defaults to 'top'.
   */
  placement?: TooltipPlacement;
  /**
   * Visual variant controlling density and max width.
   * - 'label': compact, single-line labels
   * - 'description': multi-line, wider content
   */
  variant?: TooltipVariant;
  /**
   * Optional delay before showing the tooltip (in ms).
   */
  delayMs?: number;
  /**
   * The trigger element to wrap. Tooltip never mutates this element.
   */
  children: React.ReactElement;
}
