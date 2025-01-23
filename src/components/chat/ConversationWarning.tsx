import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConversationWarning() {
  return (
    <div className="bg-red-600 text-white p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <AlertTriangle className="w-6 h-6" />
        <p className="text-lg font-medium">
          Our AI Has Detected a Lead Is Unhappy & Will Terminate The Conversation
        </p>
      </div>
    </div>
  );
}