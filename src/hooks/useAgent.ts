import { useState, useEffect } from 'react';
import { getAgent } from '../services/agents';
import type { Agent } from '../types/agent';

export function useAgent(agentId: string | undefined) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setIsLoading(false);
      return;
    }

    const loadAgent = async () => {
      try {
        const data = await getAgent(agentId);
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent');
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [agentId]);

  return { agent, isLoading, error };
}