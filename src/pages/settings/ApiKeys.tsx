import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Key, ExternalLink } from 'lucide-react';
import { Notification } from '../../components/Notification';
import { HomeButton } from '../../components/HomeButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiKey, saveApiKey } from '../../services/apiKeys';

interface ApiKeysProps {
  onSignOut?: () => void;
}

export function ApiKeys({ onSignOut }: ApiKeysProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath || '/dashboard';

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const key = await getApiKey();
      if (key) {
        setApiKey(key);
        setShowCreateAgent(true);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setNotification({
        show: true,
        message: 'Please enter an API key',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveApiKey(apiKey);
      setNotification({
        show: true,
        message: 'API key saved successfully',
        type: 'success'
      });
      setShowCreateAgent(true);
    } catch (error) {
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to save API key',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout onSignOut={onSignOut}>
      <div className="max-w-2xl mx-auto space-y-8">
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          />
        )}
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OpenAI API Key</h1>
          <p className="text-gray-600 mt-1">Configure your OpenAI API key to create and manage AI agents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Instructions */}
          <div className="mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">How to get your API key</h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                Visit the OpenAI API keys page
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-1 text-indigo-600 hover:text-indigo-500"
                >
                  here
                  <ExternalLink className="w-4 h-4 ml-0.5" />
                </a>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">2.</span>
                Sign in to your OpenAI account or create a new one
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">3.</span>
                Click on "Create new secret key"
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">4.</span>
                Give your key a name (e.g., "AI Agents App")
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">5.</span>
                Copy your API key and paste it below
              </li>
            </ol>
          </div>

          {/* API Key Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-amber-600 mb-2">
                <Key className="w-4 h-4" />
                <span className="font-medium">Security Note</span>
              </div>
              <p className="text-sm text-gray-600">
                Your API key is encrypted before being stored. We never share your key with third parties.
              </p>
            </div>

            <Input
              label="OpenAI API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={apiKey ? '••••••••' : 'Enter your OpenAI API key'}
              required
            />

            <Button type="submit" isLoading={isLoading}>
              Save API Key
            </Button>

            {showCreateAgent && (
              <div className="pt-4 border-t border-gray-200 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/create-agent')}
                >
                  Create Your First AI Agent
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      <HomeButton onClick={() => navigate(returnPath)} />
    </DashboardLayout>
  );
}