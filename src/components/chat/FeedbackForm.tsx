import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Star } from 'lucide-react';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { rating: number; comment: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function FeedbackForm({ isOpen, onClose, onSubmit, isSubmitting }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ rating, comment });
    setRating(0);
    setComment('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agent Feedback"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How helpful was this agent?
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    value <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Share your experience with this agent..."
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={rating === 0}
          >
            Submit Feedback
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}