import React from 'react';
import { WebhookManager } from '../webhooks/WebhookManager';
import { MenuItem } from '../../types/navigation';

// Add to the menu items array:
export const menuItems: MenuItem[] = [
  {
    label: 'Webhook Testing',
    icon: 'settings_ethernet', // Using a Material Icon
    path: '/webhooks',
    component: WebhookManager,
    showInNav: true
  }
]; 