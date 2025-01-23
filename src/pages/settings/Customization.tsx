import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { themes, type ThemeColors } from '../../themes';
import { useTheme } from '../../contexts/ThemeContext';
import { Check, Palette } from 'lucide-react';
import { CustomThemeForm } from '../../components/settings/CustomThemeForm';
import { LogoUpload } from '../../components/settings/LogoUpload';
import { ThemePreview } from '../../components/settings/ThemePreview';
import { supabase } from '../../lib/supabase';

export function Customization() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [logo, setLogo] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('logo_url')
        .eq('user_id', user.id)
        .single();

      if (prefs?.logo_url) {
        setLogo(prefs.logo_url);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          logo_url: url
        });

      setLogo(url);
    } catch (error) {
      console.error('Error saving logo:', error);
    }
  };

  const handleCustomThemeSave = async (colors: ThemeColors) => {
    const customTheme = {
      ...themes.custom,
      colors,
      preview: {
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background
      }
    };
    await setTheme(customTheme);
    setShowCustomForm(false);
  };

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  const standardThemes = Object.values(themes).filter(t => t.id !== 'custom');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customization</h1>
          <p className="text-gray-600 mt-1">Personalize your workspace appearance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-8">
            {/* Logo Upload Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h2>
              <LogoUpload
                currentLogo={logo}
                onUpload={handleLogoUpload}
              />
            </div>

            {/* Theme Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Theme Selection</h2>
              
              {/* Standard Themes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {standardThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme);
                      setShowCustomForm(false);
                    }}
                    className={`
                      relative p-4 rounded-lg border-2 transition-colors text-left w-full h-full
                      ${currentTheme.id === theme.id 
                        ? 'border-indigo-600' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {currentTheme.id === theme.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{theme.name}</h3>
                      <p className="text-sm text-gray-500">{theme.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Theme Option */}
              <button
                onClick={() => setShowCustomForm(true)}
                className={`
                  relative p-4 rounded-lg border-2 transition-colors text-left w-full mt-4
                  ${showCustomForm || currentTheme.id === 'custom'
                    ? 'border-indigo-600' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <Palette className="w-6 h-6 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Custom Theme</h3>
                    <p className="text-sm text-gray-500">Create your own color scheme</p>
                  </div>
                </div>
                {(showCustomForm || currentTheme.id === 'custom') && (
                  <div className="mt-4">
                    <ThemePreview theme={currentTheme} logo={logo} />
                  </div>
                )}
              </button>

              {/* Custom Theme Form */}
              {showCustomForm && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Colors</h3>
                  <CustomThemeForm
                    initialColors={currentTheme.colors}
                    onSave={handleCustomThemeSave}
                    onCancel={() => setShowCustomForm(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}