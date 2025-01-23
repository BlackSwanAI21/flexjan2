import React from 'react';
import type { FAQ } from '../../../types/webscraper';

interface FAQPreviewProps {
  faqs: FAQ[];
}

export function FAQPreview({ faqs }: FAQPreviewProps) {
  if (!faqs?.length) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Generated FAQs</h3>
      <div className="bg-gray-50 p-3 rounded-lg space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-1">
            <p className="text-gray-900 font-medium">Q: {faq.question}</p>
            <p className="text-gray-600">A: {faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}