import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWebhook, listWebhooks, deleteWebhook, toggleWebhook } from '../controller';
import { WebhookConfig } from '../../../types/webhook';

// Mock response data
const mockWebhook = {
  id: 'test-webhook-id',
  user_id: 'test-user-id',
  agent_id: 'test-agent-id',
  webhook_url: 'http://test.url/webhook',
  is_active: true
};

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [mockWebhook], error: null }),
          eq: () => ({
            single: () => Promise.resolve({ data: mockWebhook, error: null })
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: mockWebhook, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: mockWebhook, error: null })
        })
      }),
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  })
}));

describe('Webhook Controller', () => {
  const testUserId = 'test-user-id';
  const testAgentId = 'test-agent-id';
  const testConfig: WebhookConfig = {
    responseFormat: 'json',
    maxTokens: 100
  };

  describe('createWebhook', () => {
    it('should create a webhook successfully', async () => {
      const webhook = await createWebhook(testUserId, testAgentId, testConfig);
      expect(webhook).toBeDefined();
      expect(webhook.user_id).toBe(testUserId);
      expect(webhook.agent_id).toBe(testAgentId);
      expect(webhook.is_active).toBe(true);
    });
  });

  describe('listWebhooks', () => {
    it('should list webhooks for a user', async () => {
      const webhooks = await listWebhooks(testUserId);
      expect(Array.isArray(webhooks)).toBe(true);
      expect(webhooks.length).toBeGreaterThan(0);
      expect(webhooks[0].user_id).toBe(testUserId);
    });
  });

  describe('toggleWebhook', () => {
    it('should toggle webhook active status', async () => {
      const result = await toggleWebhook(testUserId, 'test-webhook-id');
      expect(result).toBe(true);
    });
  });

  describe('deleteWebhook', () => {
    it('should delete a webhook', async () => {
      const result = await deleteWebhook(testUserId, 'test-webhook-id');
      expect(result).toBe(true);
    });
  });
}); 