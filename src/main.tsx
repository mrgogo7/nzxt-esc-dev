// React entry point

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/index';
import { ModalProvider } from './ui/shared/modal/ModalProvider';
import './styles/tooltip.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  React.createElement(
    ModalProvider,
    null,
    React.createElement(App)
  )
);
