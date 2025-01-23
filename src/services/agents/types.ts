import type { Agent } from '../../types/agent';

export interface AgentResponse {
  data: Agent | null;
  error: Error | null;
}

export interface AgentFilters {
  userId?: string;
  isPublic?: boolean;
}