import React from 'react';

interface PromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PromptTextarea({ value, onChange, error }: PromptTextareaProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Agent Instructions
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        placeholder="Describe your AI agent's behavior and capabilities..."
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}