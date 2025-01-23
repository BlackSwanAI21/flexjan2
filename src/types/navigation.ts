import { ComponentType } from 'react';

export interface MenuItem {
  label: string;
  icon: string;
  path: string;
  component: ComponentType;
  showInNav: boolean;
} 