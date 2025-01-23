import React from 'react';
import { Bot, ArrowLeft } from 'lucide-react';
import { ConversationProgress } from './ConversationProgress';
import { ConversationWarning } from './ConversationWarning';
import type { Agent } from '../../types/agent';
import type { ConversationStage } from './ConversationProgress';

interface ChatHeaderProps {
  agent: Agent;
  onBack: () => void;
  conversationStage: ConversationStage;
  isTerminated: boolean;
}

export function ChatHeader({ agent, onBack, conversationStage, isTerminated }: ChatHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{agent.name}</h2>
              <p className="text-sm text-gray-500">{agent.model}</p>
            </div>
          </div>
        </div>
      </div>
      {isTerminated ? (
        <ConversationWarning />
      ) : (
        <ConversationProgress currentStage={conversationStage} />
      )}
    </div>
  );
}