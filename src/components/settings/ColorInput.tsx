import React from 'react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          pattern="^#[0-9A-Fa-f]{6}$"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}