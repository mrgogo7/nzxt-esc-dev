import React from 'react';

interface TooltipPortalContextValue {
  portalElement: HTMLElement | null;
}

const TooltipPortalContext = React.createContext<TooltipPortalContextValue | undefined>(
  undefined
);

export interface TooltipProviderProps {
  children: React.ReactNode;
}

/**
 * Global tooltip provider.
 *
 * Creates a single portal root element for all tooltips and exposes it via context.
 * Tooltip rendering remains purely UI-layer and has no side effects beyond DOM.
 */
export function TooltipProvider({ children }: TooltipProviderProps): JSX.Element {
  const [portalElement, setPortalElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const element = document.createElement('div');
    element.className = 'tooltip-portal-root';
    document.body.appendChild(element);
    setPortalElement(element);

    return () => {
      document.body.removeChild(element);
      setPortalElement(null);
    };
  }, []);

  const value = React.useMemo<TooltipPortalContextValue>(
    () => ({ portalElement }),
    [portalElement]
  );

  return (
    <TooltipPortalContext.Provider value={value}>
      {children}
    </TooltipPortalContext.Provider>
  );
}

export function useTooltipPortal(): TooltipPortalContextValue {
  const context = React.useContext(TooltipPortalContext);
  if (!context) {
    throw new Error('useTooltipPortal must be used within a TooltipProvider');
  }
  return context;
}
