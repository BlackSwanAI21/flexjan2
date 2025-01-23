import React from 'react';
import { MessageSquare } from 'lucide-react';

interface ActivityItemProps {
  agentName: string;
  timestamp: string;
  onClick: () => void;
}

export function ActivityItem({ agentName, timestamp, onClick }: ActivityItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-left">
          <p className="text-gray-900">New feedback for '{agentName}'</p>
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>
    </button>
  );
}