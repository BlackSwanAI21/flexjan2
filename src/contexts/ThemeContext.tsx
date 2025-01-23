import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { themes, type Theme } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes.default);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserTheme();
  }, []);

  const loadUserTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user, use default theme
      if (!user) {
        setThemeState(themes.default);
        setIsLoading(false);
        return;
      }

      // Try to get existing preferences
      const { data: prefs, error } = await supabase
        .from('user_preferences')
        .select('theme, custom_theme_colors')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading theme:', error);
        setThemeState(themes.default);
        return;
      }

      // If no preferences exist, create default
      if (!prefs) {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            theme: 'default'
          });
        setThemeState(themes.default);
      } else {
        // Load theme
        const themeId = prefs.theme || 'default';
        const baseTheme = themes[themeId] || themes.default;
        
        // If custom theme, merge with custom colors
        if (themeId === 'custom' && prefs.custom_theme_colors) {
          setThemeState({
            ...baseTheme,
            colors: prefs.custom_theme_colors
          });
        } else {
          setThemeState(baseTheme);
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setThemeState(themes.default);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Prepare the update data
      const updateData: any = {
        user_id: user.id,
        theme: newTheme.id
      };

      // If custom theme, include the colors
      if (newTheme.id === 'custom' && newTheme.colors) {
        updateData.custom_theme_colors = newTheme.colors;
      }

      // Update database
      const { error } = await supabase
        .from('user_preferences')
        .upsert(updateData);

      if (error) throw error;

      // Update local state
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  // Always render with a theme, even during loading
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme.className}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}