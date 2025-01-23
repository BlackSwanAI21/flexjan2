export interface WebhookConfig {
  responseFormat: 'text' | 'json';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface WebhookPayload {
  type: 'message' | 'contact' | 'task';
  data: {
    id: string;
    content: string;
    timestamp: string;
    contactInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    metadata?: Record<string, any>;
  };
  source: 'ghl';
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    agentId: string;
    messageId: string;
    conversationId: string;
  };
  error?: {
    code: string;
    details: string;
  };
  timestamp: string;
}

export interface WebhookMetrics {
  totalCalls: number;
  averageResponseTime: number;
  errorRate: number;
  lastStatus: 'healthy' | 'degraded' | 'failed';
  agentMetrics: {
    agentId: string;
    totalCalls: number;
    averageResponseTime: number;
  };
}

export enum WebhookErrorType {
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  OPENAI_ERROR = 'OPENAI_ERROR'
} 