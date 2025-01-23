import crypto from 'crypto';
import { WebhookErrorType } from '../types/webhook';

export class WebhookError extends Error {
  constructor(
    message: string,
    public type: WebhookErrorType,
    public statusCode: number = 500,
    public shouldRetry: boolean = false
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export function verifyWebhookSignature(
  signature: string,
  payload: string,
  secret: string = import.meta.env.VITE_WEBHOOK_SECRET
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hmac)
    );
  } catch (error) {
    throw new WebhookError(
      'Invalid webhook signature',
      WebhookErrorType.INVALID_SIGNATURE,
      401,
      false
    );
  }
}

export function generateWebhookUrl(userId: string, agentId: string): string {
  const baseUrl = import.meta.env.VITE_NGROK_URL || 
                 import.meta.env.VITE_WEBHOOK_LOCAL_URL;
  
  const uniqueId = crypto.randomBytes(16).toString('hex');
  return `${baseUrl}/api/webhook/${userId}/${agentId}/${uniqueId}`;
}

export async function retryWebhook<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof WebhookError && !error.shouldRetry) {
        throw error;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new WebhookError(
    'Max retries exceeded',
    WebhookErrorType.PROCESSING_ERROR,
    500,
    false
  );
} 