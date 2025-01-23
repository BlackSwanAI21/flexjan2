import React, { useState } from 'react';
import { Star, User, ChevronDown, ChevronUp } from 'lucide-react';
import type { Feedback } from '../../types/feedback';

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export function FeedbackList({ feedbacks }: FeedbackListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (feedbacks.length === 0) return null;

  const displayedFeedbacks = isExpanded ? feedbacks : feedbacks.slice(0, 2);

  return (
    <div className="border-t mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-sm text-gray-600 hover:text-gray-900"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium">Recent Feedback</span>
          <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
            {feedbacks.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 pb-3">
          {displayedFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < feedback.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(feedback.created_at).toLocaleDateString()}
                </span>
              </div>
              {feedback.comment && (
                <p className="text-sm text-gray-700 mt-2">{feedback.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}