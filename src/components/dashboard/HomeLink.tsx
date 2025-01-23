import React from 'react';
import { Home } from 'lucide-react';
import { SidebarLink } from './SidebarLink';

interface HomeLinkProps {
  onClick: () => void;
}

export function HomeLink({ onClick }: HomeLinkProps) {
  return (
    <SidebarLink
      icon={Home}
      label="Dashboard"
      href="/dashboard"
      onClick={onClick}
    />
  );
}