import React from 'react';
import { Bot } from 'lucide-react';
import type { ScrapedData } from '../../../types/webscraper';

interface ScrapingPreviewProps {
  data: ScrapedData | null;
  isLoading: boolean;
}

export function ScrapingPreview({ data, isLoading }: ScrapingPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analysis Preview</h2>
          <p className="text-sm text-gray-500">Extracted information from website</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <p className="text-indigo-600 font-medium">Analysis in Progress...</p>
            <ul className="text-sm text-indigo-600 space-y-2">
              <li>• Analyzing website structure</li>
              <li>• Extracting company information</li>
              <li>• Identifying services and offerings</li>
              <li>• Preparing content summary</li>
            </ul>
            <p className="text-xs text-indigo-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Company Name</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-900">{data.companyName}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">{data.description}</p>
            </div>
          </div>

          {data.services && data.services.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Services</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <ul className="space-y-2">
                  {data.services.map((service, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="text-gray-600">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {data.contactInfo && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {data.contactInfo.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {data.contactInfo.phone}
                  </p>
                )}
                {data.contactInfo.email && (
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {data.contactInfo.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Enter a website URL to see the analysis
        </div>
      )}
    </div>
  );
}