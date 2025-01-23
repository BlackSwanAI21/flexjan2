import React from 'react';
import { Home } from 'lucide-react';

interface HomeButtonProps {
  onClick: () => void;
}

export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      aria-label="Go to dashboard"
    >
      <Home className="w-6 h-6" />
    </button>
  );
}