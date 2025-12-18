import React from 'react';
import type { ModalContextValue } from './modal.context';
import { ModalContextProvider } from './modal.context';
import type { ModalState, ModalType, ModalPayloadMap } from './modal.types';
import { ModalRoot } from './ModalRoot';

export interface ModalProviderProps {
  children: React.ReactNode;
}

/**
 * Global modal provider.
 *
 * Owns the single modal state for the entire application and
 * exposes the `openModal` / `closeModal` API via context.
 */
export function ModalProvider({ children }: ModalProviderProps): JSX.Element {
  const [state, setState] = React.useState<ModalState>({
    type: null,
    props: undefined,
  });

  const openModal = React.useCallback(
    <TType extends ModalType>(config: {
      type: TType;
      props: ModalPayloadMap[TType];
    }) => {
      setState({
        type: config.type,
        props: config.props,
      });
    },
    []
  );

  const closeModal = React.useCallback(() => {
    setState({
      type: null,
      props: undefined,
    });
  }, []);

  const contextValue = React.useMemo<ModalContextValue>(
    () => ({
      state,
      openModal,
      closeModal,
    }),
    [state, openModal, closeModal]
  );

  return (
    <ModalContextProvider value={contextValue}>
      {children}
      <ModalRoot />
    </ModalContextProvider>
  );
}

