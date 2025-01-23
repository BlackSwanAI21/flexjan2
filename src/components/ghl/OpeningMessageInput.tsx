import React from 'react';

interface OpeningMessageInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OpeningMessageInput({ value, onChange }: OpeningMessageInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Opening Message
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Hi it's Sarah from Company Name, is that the same {{contact.first_name}} who was interested in product/service?"
      />
    </div>
  );
}