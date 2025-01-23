import React from 'react';
import { Zap, Target, Calendar, Cog } from 'lucide-react';

interface WelcomePagePreviewProps {
  agentName: string;
}

export function WelcomePagePreview({ agentName }: WelcomePagePreviewProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Meet Your AI Assistant: {agentName}
        </h3>
        <p className="text-sm text-gray-600">
          Experience the future of AI Sales Agents with our intelligent assistant
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-blue-50 rounded">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Instant Response</span>
          </div>
          <p className="text-xs text-gray-600">
            24/7 instant engagement with leads
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-medium">Smart Grading</span>
          </div>
          <p className="text-xs text-gray-600">
            Automated lead qualification
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-purple-50 rounded">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Scheduling</span>
          </div>
          <p className="text-xs text-gray-600">
            Automated meeting booking
          </p>
        </div>

        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-orange-50 rounded">
              <Cog className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-medium">Conversion</span>
          </div>
          <p className="text-xs text-gray-600">
            Goal-driven interactions
          </p>
        </div>
      </div>
    </div>
  );
}