import React from 'react';
import type { ModalPayloadMap, ModalState, ModalType } from './modal.types';

/**
 * Public modal context value.
 * Exposes read-only state and imperative API methods.
 */
export interface ModalContextValue {
  state: ModalState;
  openModal<TType extends ModalType>(
    config: {
      type: TType;
      props: ModalPayloadMap[TType];
    }
  ): void;
  closeModal(): void;
}

const ModalContext = React.createContext<ModalContextValue | undefined>(
  undefined
);

/**
 * Hook for accessing the modal context.
 * Throws if used outside of `ModalProvider`.
 */
export function useModal(): ModalContextValue {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

/**
 * Internal-only helper for providing modal context.
 */
export const ModalContextProvider = ModalContext.Provider;

