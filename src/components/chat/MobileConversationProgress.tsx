import React from 'react';
import { MessageSquare, Check, Target, PartyPopper } from 'lucide-react';
import type { ConversationStage } from './ConversationProgress';
import { Confetti } from './Confetti';

interface MobileConversationProgressProps {
  currentStage: ConversationStage;
}

const stages = {
  new: {
    label: 'New Lead No Response',
    icon: MessageSquare,
    color: 'indigo'
  },
  responded: {
    label: 'Lead Responded',
    icon: Check,
    color: 'blue'
  },
  qualified: {
    label: 'Lead Qualified',
    icon: Target,
    color: 'green'
  },
  completed: {
    label: 'Objective Reached',
    icon: PartyPopper,
    color: 'purple'
  }
} as const;

export function MobileConversationProgress({ currentStage }: MobileConversationProgressProps) {
  const stage = stages[currentStage];
  const Icon = stage.icon;

  return (
    <>
      <Confetti isActive={currentStage === 'completed'} />
      <div className="w-full border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-center space-x-3">
          <div className={`w-8 h-8 rounded-full bg-${stage.color}-50 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${stage.color}-600`} />
          </div>
          <span className="font-medium text-gray-900">{stage.label}</span>
        </div>
      </div>
    </>
  );
}