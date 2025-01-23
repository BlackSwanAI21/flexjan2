import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../Button';

interface CreateAgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

export function CreateAgentCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  disabled,
  comingSoon
}: CreateAgentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
            {comingSoon && (
              <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            )}
          </h3>
        </div>
      </div>

      <p className="text-gray-600 mb-6">{description}</p>

      <Button
        onClick={onClick}
        disabled={disabled}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}