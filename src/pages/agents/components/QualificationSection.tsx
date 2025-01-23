import React from 'react';
import { Input } from '../../../components/Input';
import type { BasicTemplateFormData } from '../types';

interface QualificationSectionProps {
  formData: BasicTemplateFormData;
}

export function QualificationSection({ formData }: QualificationSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Qualification Questions</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualified Prospect Questions
          </label>
          <textarea
            value={formData.qualifiedProspect}
            onChange={(e) => formData.setFormData(prev => ({ ...prev, qualifiedProspect: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Write the questions you want the AI to ask your prospects. For example:&#10;1) Find out how much they're spending on their energy bill each month&#10;2) Find out if they'd like to save money on their monthly bill by switching to solar"
            required
          />
        </div>

        <Input
          label="Opening Message"
          value={formData.openingMessage}
          onChange={(e) => formData.setFormData(prev => ({ ...prev, openingMessage: e.target.value }))}
          placeholder="Enter your initial message to prospects"
          required
        />
      </div>
    </div>
  );
}