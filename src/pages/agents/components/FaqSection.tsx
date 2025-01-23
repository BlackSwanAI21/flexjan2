import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { BasicTemplateFormData } from '../types';

interface FaqSectionProps {
  formData: BasicTemplateFormData;
}

export function FaqSection({ formData }: FaqSectionProps) {
  const addFaq = () => {
    formData.setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (index: number) => {
    formData.setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    formData.setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Additional FAQs</h2>
      
      <div className="space-y-6">
        {formData.faqs.map((faq, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {index + 1}
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter FAQ question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter FAQ answer"
                  />
                </div>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={addFaq}
        className="w-full"
      >
        Add FAQ
      </Button>
    </div>
  );
}