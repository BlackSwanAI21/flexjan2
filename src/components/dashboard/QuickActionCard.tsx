import React from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function QuickActionCard({ icon: Icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="block w-full p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-indigo-600 transition-colors group text-left"
    >
      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
        <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </button>
  );
}