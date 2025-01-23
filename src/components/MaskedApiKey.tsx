import React from 'react';

interface MaskedApiKeyProps {
  apiKey: string;
}

export function MaskedApiKey({ apiKey }: MaskedApiKeyProps) {
  // Show first 3 and last 4 characters, mask the rest
  const maskedKey = apiKey
    ? `${apiKey.slice(0, 3)}${'•'.repeat(apiKey.length - 7)}${apiKey.slice(-4)}`
    : '';

  return (
    <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
      {maskedKey || 'No API key set'}
    </div>
  );
}