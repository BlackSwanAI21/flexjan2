import { useState, useEffect } from 'react';
import { fetchCustomValues } from '../services/ghl/api';
import type { CustomValue } from '../services/ghl/types';

export function useGHLCustomFields(apiKey: string) {
  const [customFields, setCustomFields] = useState<CustomValue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (apiKey?.trim()) {
      loadCustomFields();
    }
  }, [apiKey]);

  const loadCustomFields = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fields = await fetchCustomValues(apiKey);
      setCustomFields(fields);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load custom fields';
      console.error('GHL Custom Fields Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { customFields, isLoading, error };
}