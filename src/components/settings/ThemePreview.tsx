import React from 'react';
import { Bot } from 'lucide-react';
import type { Theme } from '../../themes';

interface ThemePreviewProps {
  theme: Theme;
  logo?: string;
}

export function ThemePreview({ theme, logo }: ThemePreviewProps) {
  const style = {
    '--preview-primary': theme.preview.primary,
    '--preview-secondary': theme.preview.secondary,
    '--preview-background': theme.preview.background,
  } as React.CSSProperties;

  return (
    <div className="border rounded-lg overflow-hidden" style={style}>
      {/* Header */}
      <div className="bg-[var(--preview-background)] p-4 border-b">
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Company logo" className="h-8" />
          ) : (
            <Bot className="w-8 h-8 text-[var(--preview-primary)]" />
          )}
          <span className="font-medium" style={{ color: theme.preview.primary }}>
            Preview
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-4">
        <div className="space-y-4">
          <div className="h-4 bg-[var(--preview-background)] rounded w-3/4" />
          <div className="h-4 bg-[var(--preview-background)] rounded w-1/2" />
          <div
            className="inline-block px-4 py-2 rounded text-white cursor-default"
            style={{ backgroundColor: theme.preview.primary }}
          >
            Sample Button
          </div>
        </div>
      </div>
    </div>
  );
}