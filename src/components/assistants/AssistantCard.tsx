import React from 'react';
import { Bot, Clock } from 'lucide-react';
import { Button } from '../Button';
import type { OpenAIAssistant } from '../../services/openai/assistants';

interface AssistantCardProps {
  assistant: OpenAIAssistant;
  onImport: (assistant: OpenAIAssistant) => void;
  isImporting: boolean;
}

export function AssistantCard({ assistant, onImport, isImporting }: AssistantCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{assistant.name}</h3>
            <p className="text-sm text-gray-500">{assistant.model}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {assistant.description && (
          <p className="text-gray-600 text-sm">{assistant.description}</p>
        )}
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          Created {new Date(assistant.created_at * 1000).toLocaleDateString()}
        </div>

        <Button
          onClick={() => onImport(assistant)}
          isLoading={isImporting}
          className="w-full"
        >
          Import Assistant
        </Button>
      </div>
    </div>
  );
}