import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
        transition-colors duration-200 ease-in-out focus:outline-none
        ${checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-200 bg-gray-200'}
      `}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
          ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}