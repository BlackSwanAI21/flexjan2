import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { FieldMatchingDisplay } from './FieldMatchingDisplay';
import { matchRequiredFields } from '../../services/ghl/fieldMapping';
import type { CustomValue } from '../../services/ghl/types';

interface CustomFieldsDisplayProps {
  customFields: CustomValue[];
  isLoading: boolean;
  error: string | null;
}

export function CustomFieldsDisplay({ customFields, isLoading, error }: CustomFieldsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-gray-600">Fetching custom fields from GoHighLevel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Fetching Custom Fields</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const matchedFields = matchRequiredFields(customFields);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Field Matching Results */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Fields Status</h3>
        <FieldMatchingDisplay matchedFields={matchedFields} />
      </div>

      {/* Raw Response Data */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Raw API Response</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-xs text-gray-600 overflow-auto max-h-96">
            {JSON.stringify(customFields, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}