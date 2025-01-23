import React from 'react';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="py-2 px-3 bg-gray-100 rounded-lg">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}