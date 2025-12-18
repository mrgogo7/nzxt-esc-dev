// Main application entry point

import React, { useEffect } from 'react';
import { isKrakenView } from './mode';
import { ConfigApp } from '../ui/config/ConfigApp';
import { KrakenApp } from '../ui/kraken/KrakenApp';
import { APP_META } from './meta';
import '../styles/root.css';

/**
 * Application component.
 * Routes to Config or Kraken view based on URL parameter.
 * Applies mode-aware root class for CSS-based behavior.
 */
export function App(): JSX.Element {
  const isKraken = isKrakenView();
  const modeClass = isKraken ? 'kraken' : 'config';

  useEffect(() => {
    // Ensure document title uses single-source-of-truth application identity.
    document.title = APP_META.displayName;

    const root = document.getElementById('root');
    if (root) {
      root.className = `app-root ${modeClass}`;
    }

    if (isKraken) {
      document.body.classList.add('kraken-mode');
    } else {
      document.body.classList.remove('kraken-mode');
    }
  }, [isKraken, modeClass]);

  if (isKraken) {
    return React.createElement(KrakenApp);
  }
  return React.createElement(ConfigApp);
}

/**
 * Legacy init function for backward compatibility.
 * @deprecated Use App component instead.
 */
export function initApp(): void {
  // This function is kept for compatibility but is no longer used in Vite runtime.
  // The App component is used instead.
}
