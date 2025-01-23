import React from 'react';
import { Trash2 } from 'lucide-react';
import type { FAQ } from '../../../types/webscraper';

interface FAQEditorProps {
  faqs: FAQ[];
  onChange: (index: number, field: 'question' | 'answer', value: string) => void;
  onRemove: (index: number) => void;
}

export function FAQEditor({ faqs, onChange, onRemove }: FAQEditorProps) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className="bg-gray-50 p-4 rounded-lg space-y-3 relative"
        >
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove FAQ"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Question {index + 1}
            </label>
            <textarea
              value={faq.question}
              onChange={(e) => onChange(index, 'question', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
              placeholder="Enter FAQ question"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              value={faq.answer}
              onChange={(e) => onChange(index, 'answer', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Enter FAQ answer"
            />
          </div>
        </div>
      ))}

      {faqs.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          No FAQs added yet. Click "Add FAQ" to create one.
        </div>
      )}
    </div>
  );
}