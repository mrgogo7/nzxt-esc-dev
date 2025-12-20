import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import './alert.css';

export type AlertVariant = 'info' | 'warning' | 'loading';

export interface AlertProps {
  variant: AlertVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Alert({ variant, icon: Icon, children }: AlertProps): JSX.Element {
  // For loading variant, use Loader2 with animation
  const DisplayIcon = variant === 'loading' ? Loader2 : Icon;

  return (
    <div className={`alert alert--${variant}`}>
      {DisplayIcon && (
        <DisplayIcon
          size={16}
          className={variant === 'loading' ? 'alert-icon--spinning' : 'alert-icon'}
        />
      )}
      <span className="alert-text">{children}</span>
    </div>
  );
}
