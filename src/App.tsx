import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { ApiKeys } from './pages/settings/ApiKeys';
import { Customization } from './pages/settings/Customization';
import { CreateAgent } from './pages/CreateAgent';
import { BasicTemplateForm } from './pages/agents/BasicTemplateForm';
import { CustomPromptForm } from './pages/agents/CustomPromptForm';
import { WebScraperTemplate } from './pages/agents/WebScraperTemplate';
import { ImportGHL } from './pages/ImportGHL';
import { ImportAssistant } from './pages/ImportAssistant';
import { Agents } from './pages/Agents';
import { Chat } from './pages/Chat';
import { PublicAgentView } from './pages/PublicAgentView';
import { WelcomePage } from './pages/WelcomePage';
import { ConversationHistory } from './pages/ConversationHistory';
import { WebhookManager } from './components/webhooks/WebhookManager';

// Protected routes wrapper component
function ProtectedRoutes({ onSignOut }: { onSignOut: () => Promise<void> }) {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-agent" element={<CreateAgent />} />
      <Route path="/create-agent/basic-template" element={<BasicTemplateForm />} />
      <Route path="/create-agent/web-scraper" element={<WebScraperTemplate />} />
      <Route path="/create-agent/custom" element={<CustomPromptForm />} />
      <Route path="/import" element={<ImportAssistant />} />
      <Route path="/import-ghl" element={<ImportGHL />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/chat/:agentId" element={<Chat />} />
      <Route path="/conversations/:agentId" element={<ConversationHistory />} />
      <Route path="/settings/api-keys" element={<ApiKeys onSignOut={onSignOut} />} />
      <Route path="/settings/customization" element={<Customization />} />
      <Route path="/webhooks" element={<WebhookManager />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/shared/:token" element={<PublicAgentView />} />
      <Route path="/welcome/:token" element={<WelcomePage />} />

      {/* Auth routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : isLogin ? (
            <Login
              onSignupClick={() => setIsLogin(false)}
              onLoginSuccess={handleLogin}
            />
          ) : (
            <Signup
              onLoginClick={() => setIsLogin(true)}
              onSignupSuccess={handleLogin}
            />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <ProtectedRoutes onSignOut={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}