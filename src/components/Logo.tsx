import React from 'react';
import { Bot } from 'lucide-react';

interface LogoProps {
  logo: string | null;
  showText?: boolean;
  className?: string;
}

export function Logo({ logo, showText = true, className = 'h-8' }: LogoProps) {
  if (logo) {
    return (
      <img 
        src={logo} 
        alt="Company logo" 
        className={`${className} w-auto opacity-100 transition-opacity duration-200`}
        onError={(e) => {
          e.currentTarget.src = '';
          e.currentTarget.onerror = null;
        }}
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Bot className={`${className} text-indigo-600`} />
      {showText && (
        <span className="text-xl font-bold text-gray-900">AI Agents</span>
      )}
    </div>
  );
}