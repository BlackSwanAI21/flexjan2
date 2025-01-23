import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface FeedbackButtonProps {
  onClick: () => void;
  feedbackCount: number;
}

export function FeedbackButton({ onClick, feedbackCount }: FeedbackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
    >
      <MessageSquarePlus className="w-5 h-5" />
      <span className="font-medium">Submit Feedback</span>
      {feedbackCount > 0 && (
        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-sm">
          {feedbackCount}
        </span>
      )}
    </button>
  );
}