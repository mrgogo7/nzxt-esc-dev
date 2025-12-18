import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import type { TooltipContent, TooltipPlacement, TooltipProps, TooltipVariant } from './tooltip.types';

/**
 * Wrapper around `react-tooltip` providing a consistent NZXT-style API.
 *
 * - UI passes already-resolved strings (or string[] for multi-line)
 * - Components must NOT import `react-tooltip` directly
 * - Supports hover and keyboard focus
 */
export function Tooltip({
  content,
  placement = 'top',
  variant = 'label',
  delayMs,
  children,
}: TooltipProps): JSX.Element {
  const id = React.useId();

  const resolvedVariant: TooltipVariant = variant;
  const resolvedPlacement: TooltipPlacement = placement;

  const lines: string[] = React.useMemo(() => {
    if (Array.isArray(content)) {
      return content;
    }
    return [content];
  }, [content]);

  const tooltipContent: TooltipContent = lines.length === 1 ? lines[0] : lines.join('\n');

  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-place={resolvedPlacement}
        {...(typeof delayMs === 'number' ? { 'data-tooltip-delay-show': delayMs } : {})}
      >
        {children}
      </span>
      <ReactTooltip
        id={id}
        className={`nzxt-tooltip nzxt-tooltip--${resolvedVariant}`}
        classNameArrow="nzxt-tooltip__arrow"
        content={tooltipContent}
      />
    </>
  );
}
