import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiKey } from '../services/apiKeys';

export function useApiKeyCheck() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkApiKey() {
      try {
        const apiKey = await getApiKey();
        setHasApiKey(!!apiKey);
      } catch (error) {
        console.error('Error checking API key:', error);
        setHasApiKey(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkApiKey();
  }, []);

  const redirectToApiKeySetup = () => {
    navigate('/settings/api-keys', {
      state: { returnPath: window.location.pathname }
    });
  };

  return { hasApiKey, isLoading, redirectToApiKeySetup };
}