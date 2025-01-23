import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { MatchedFields } from '../../services/ghl/fieldMapping';

interface FieldMatchingDisplayProps {
  matchedFields: MatchedFields;
}

export function FieldMatchingDisplay({ matchedFields }: FieldMatchingDisplayProps) {
  const allFieldsMatched = Object.values(matchedFields).every(field => field.matched);
  const matchedCount = Object.values(matchedFields).filter(field => field.matched).length;
  const totalFields = Object.keys(matchedFields).length;

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`p-4 rounded-lg ${allFieldsMatched ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center space-x-2">
          {allFieldsMatched ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <div>
            <h3 className={`font-medium ${allFieldsMatched ? 'text-green-800' : 'text-yellow-800'}`}>
              {allFieldsMatched ? 'All Required Fields Found' : 'Missing Required Fields'}
            </h3>
            <p className="text-sm text-gray-600">
              {matchedCount} of {totalFields} required fields matched
            </p>
          </div>
        </div>
      </div>

      {/* Field List */}
      <div className="space-y-2">
        {Object.entries(matchedFields).map(([key, field]) => (
          <div 
            key={key}
            className={`p-3 rounded-lg border ${
              field.matched ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {field.matched ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900">
                    {key.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {field.matched ? (
                    <>
                      <span className="font-medium">ID:</span> {field.id}
                      <br />
                      <span className="font-medium">Name:</span> {field.name}
                    </>
                  ) : (
                    <span className="text-gray-500">Field not found</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {field.fieldKey}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}