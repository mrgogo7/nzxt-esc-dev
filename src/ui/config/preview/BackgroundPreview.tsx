// Background preview component

import type { RenderModel } from '../../../render/model/render.types';
import { renderBackground } from '../../../render/engine';
import { DEFAULT_VIEWPORT } from '../../../render/viewport';

interface BackgroundPreviewProps {
  model: RenderModel;
}

export function BackgroundPreview({ model }: BackgroundPreviewProps): JSX.Element {
  const viewport = DEFAULT_VIEWPORT;
  const previewSize = 200;

  const backgroundStyle = renderBackground(model, {
    width: previewSize,
    height: previewSize,
    isCircular: viewport.isCircular,
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div
        className="render-background render-background-circle"
        style={{
          ...backgroundStyle,
          width: `${previewSize}px`,
          height: `${previewSize}px`,
          border: '14px solid #000',
          borderRadius: '50%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

