import { z } from 'zod';

export const themeSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  primaryHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  cardBg: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type ThemeColors = z.infer<typeof themeSchema>;

export interface Theme {
  id: string;
  name: string;
  description: string;
  className: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
  colors?: ThemeColors;
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Default Theme',
    description: 'Clean and professional design with indigo accents',
    className: 'theme-default',
    preview: {
      primary: '#4F46E5',
      secondary: '#6366F1',
      background: '#F9FAFB'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Modern dark theme for reduced eye strain',
    className: 'theme-dark',
    preview: {
      primary: '#6366F1',
      secondary: '#818CF8',
      background: '#111827'
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Theme',
    description: 'Calming blue tones inspired by the sea',
    className: 'theme-ocean',
    preview: {
      primary: '#0EA5E9',
      secondary: '#38BDF8',
      background: '#F0F9FF'
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest Theme',
    description: 'Natural green palette for a fresh look',
    className: 'theme-forest',
    preview: {
      primary: '#059669',
      secondary: '#10B981',
      background: '#F0FDF4'
    }
  },
  custom: {
    id: 'custom',
    name: 'Custom Theme',
    description: 'Your personalized color scheme',
    className: 'theme-custom',
    preview: {
      primary: '#4F46E5',
      secondary: '#6366F1',
      background: '#F9FAFB'
    }
  }
};