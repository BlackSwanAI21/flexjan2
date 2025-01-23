import React, { useEffect, useState } from 'react';
import { Bot, List, LogOut, Import, Settings } from 'lucide-react';
import { SidebarLink } from '../components/dashboard/SidebarLink';
import { HomeLink } from '../components/dashboard/HomeLink';
import { SettingsDropdown } from '../components/dashboard/SettingsDropdown';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

export function DashboardLayout({ children, onSignOut }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | undefined>();
  const [isLogoLoading, setIsLogoLoading] = useState(true);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('logo_url')
        .eq('user_id', user.id)
        .single();

      setLogo(prefs?.logo_url);
    } catch (error) {
      console.error('Error loading logo:', error);
    } finally {
      setIsLogoLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 h-8">
              {!isLogoLoading && (
                logo ? (
                  <img 
                    src={logo} 
                    alt="Company logo" 
                    className="h-8 w-auto opacity-100 transition-opacity duration-200"
                    onError={() => setLogo(undefined)}
                  />
                ) : (
                  <div className="flex items-center space-x-2 opacity-100 transition-opacity duration-200">
                    <Bot className="w-8 h-8 text-indigo-600" />
                    <span className="text-xl font-bold text-gray-900">AI Agents</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <HomeLink onClick={() => handleNavigate('/dashboard')} />
            <SidebarLink 
              icon={Bot} 
              href="/create-agent" 
              label="Create AI Agent" 
              onClick={() => handleNavigate('/create-agent')}
            />
            <SidebarLink 
              icon={List} 
              href="/agents" 
              label="View My Agents" 
              onClick={() => handleNavigate('/agents')}
            />
            <SidebarLink 
              icon={Import} 
              href="/import-ghl" 
              label="Import to GoHighLevel" 
              onClick={() => handleNavigate('/import-ghl')}
            />
            <SidebarLink 
              icon={Settings} 
              href="/webhooks" 
              label="Webhook Testing" 
              onClick={() => handleNavigate('/webhooks')}
            />
            <SettingsDropdown onNavigate={handleNavigate} />
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={onSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}