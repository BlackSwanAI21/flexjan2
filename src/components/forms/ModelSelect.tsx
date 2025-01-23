import React from 'react';

export const AI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4 Original' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-4o-mini', name: 'GPT-4 Mini' }
] as const;

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ModelSelect({ value, onChange, error }: ModelSelectProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <option value="">Select a model</option>
        {AI_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}