import React from 'react';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  highlight?: boolean;
}

export function FormField({ 
  label, 
  value, 
  onChange, 
  required, 
  placeholder,
  highlight 
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {highlight && (
          <span className="ml-2 text-amber-600 text-xs">
            Please fill this field
          </span>
        )}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}
        `}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}