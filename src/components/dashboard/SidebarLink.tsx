import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarLinkProps {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function SidebarLink({ icon: Icon, label, href, onClick }: SidebarLinkProps) {
  const isActive = window.location.pathname === href;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors text-left
        ${isActive 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}