import React from 'react';
import { Check, MessageSquare, Target, Calendar, PartyPopper } from 'lucide-react';
import { MobileConversationProgress } from './MobileConversationProgress';
import { Confetti } from './Confetti';

export type ConversationStage = 'new' | 'responded' | 'qualified' | 'completed';

interface ConversationProgressProps {
  currentStage: ConversationStage;
}

interface Stage {
  id: ConversationStage;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const stages: Stage[] = [
  {
    id: 'new',
    label: 'New Lead No Response',
    icon: MessageSquare,
    color: 'indigo'
  },
  {
    id: 'responded',
    label: 'Lead Responded',
    icon: Check,
    color: 'blue'
  },
  {
    id: 'qualified',
    label: 'Lead Qualified',
    icon: Target,
    color: 'green'
  },
  {
    id: 'completed',
    label: 'Objective Reached',
    icon: PartyPopper,
    color: 'purple'
  }
];

export function ConversationProgress({ currentStage }: ConversationProgressProps) {
  // Show mobile version on smaller screens
  return (
    <>
      <Confetti isActive={currentStage === 'completed'} />
      
      {/* Mobile version */}
      <div className="md:hidden">
        <MobileConversationProgress currentStage={currentStage} />
      </div>

      {/* Desktop version */}
      <div className="hidden md:block w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded" />
            
            {/* Active Progress Bar */}
            <div 
              className={`
                absolute top-5 left-0 h-1 rounded transition-all duration-500
                ${currentStage === 'completed' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600' : 'bg-indigo-600'}
              `}
              style={{ width: `${((stages.findIndex(stage => stage.id === currentStage) + 1) / stages.length) * 100}%` }}
            />

            {/* Stage Indicators */}
            <div className="relative z-10 flex justify-between">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index <= stages.findIndex(s => s.id === currentStage);
                const isCurrentStage = stage.id === currentStage;
                const isFinalStage = stage.id === 'completed';

                return (
                  <div key={stage.id} className="flex flex-col items-center">
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-500
                        ${isActive ? `bg-${stage.color}-100 ring-4 ring-${stage.color}-50` : 'bg-gray-100'}
                        ${isCurrentStage && isFinalStage ? 'animate-bounce' : ''}
                        ${isCurrentStage ? 'animate-pulse' : ''}
                      `}
                    >
                      <Icon 
                        className={`
                          w-5 h-5 
                          ${isActive ? `text-${stage.color}-600` : 'text-gray-400'}
                          ${isCurrentStage && isFinalStage ? 'animate-spin' : ''}
                        `}
                      />
                    </div>
                    <span 
                      className={`
                        mt-2 text-sm font-medium whitespace-nowrap
                        ${isActive ? 'text-gray-900' : 'text-gray-500'}
                        ${isCurrentStage && isFinalStage ? 'text-purple-600 font-bold' : ''}
                      `}
                    >
                      {stage.label}
                    </span>
                    {isCurrentStage && isFinalStage && (
                      <span className="mt-1 text-xs text-purple-600 font-medium animate-pulse">
                        🎉 Lead Successfully Converted! 🎉
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}