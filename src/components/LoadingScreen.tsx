import React from 'react';
import { Bot } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { Logo } from './Logo';

interface LoadingScreenProps {
  logo?: string | null;
  message?: string;
}

export function LoadingScreen({ logo, message = 'Loading AI Agent...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <Logo logo={logo} className="h-12 mx-auto mb-6" />
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Bot className="w-6 h-6 text-indigo-600" />
          <LoadingSpinner size="md" />
        </div>
        <p className="text-gray-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
}