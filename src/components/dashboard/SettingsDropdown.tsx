import React, { useState, useRef } from 'react';
import { Settings, Key, Palette, ChevronDown } from 'lucide-react';

interface SettingsDropdownProps {
  onNavigate?: (path: string) => void;
}

export function SettingsDropdown({ onNavigate }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
      setIsOpen(false);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`
        flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors w-full cursor-pointer
        ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}>
        <Settings className="w-5 h-5" />
        <span className="font-medium flex-1">Settings</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div 
          className="absolute left-0 w-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200"
          style={{ marginTop: '2px' }}
        >
          <button
            onClick={handleClick('/settings/api-keys')}
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Key className="w-4 h-4" />
            <span>OpenAI API Key</span>
          </button>
          <button
            onClick={handleClick('/settings/customization')}
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Palette className="w-4 h-4" />
            <span>Customization</span>
          </button>
        </div>
      )}
    </div>
  );
}