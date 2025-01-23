import React, { useState } from 'react';
import { themeSchema, type ThemeColors } from '../../themes';
import { ColorInput } from './ColorInput';

interface CustomThemeFormProps {
  initialColors?: ThemeColors;
  onSave: (colors: ThemeColors) => void;
  onCancel: () => void;
}

export function CustomThemeForm({ initialColors, onSave, onCancel }: CustomThemeFormProps) {
  const [colors, setColors] = useState<ThemeColors>(initialColors || {
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    secondary: '#6366F1',
    background: '#F9FAFB',
    cardBg: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    borderColor: '#E5E7EB'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = themeSchema.safeParse(colors);
    if (result.success) {
      onSave(colors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorInput
          label="Primary Color"
          value={colors.primary}
          onChange={(value) => setColors(prev => ({ ...prev, primary: value }))}
        />
        <ColorInput
          label="Primary Hover"
          value={colors.primaryHover}
          onChange={(value) => setColors(prev => ({ ...prev, primaryHover: value }))}
        />
        <ColorInput
          label="Secondary Color"
          value={colors.secondary}
          onChange={(value) => setColors(prev => ({ ...prev, secondary: value }))}
        />
        <ColorInput
          label="Background"
          value={colors.background}
          onChange={(value) => setColors(prev => ({ ...prev, background: value }))}
        />
        <ColorInput
          label="Card Background"
          value={colors.cardBg}
          onChange={(value) => setColors(prev => ({ ...prev, cardBg: value }))}
        />
        <ColorInput
          label="Text Primary"
          value={colors.textPrimary}
          onChange={(value) => setColors(prev => ({ ...prev, textPrimary: value }))}
        />
        <ColorInput
          label="Text Secondary"
          value={colors.textSecondary}
          onChange={(value) => setColors(prev => ({ ...prev, textSecondary: value }))}
        />
        <ColorInput
          label="Border Color"
          value={colors.borderColor}
          onChange={(value) => setColors(prev => ({ ...prev, borderColor: value }))}
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Custom Theme
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}