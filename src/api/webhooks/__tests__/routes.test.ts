import { describe, it, expect, vi } from 'vitest';
import { Request } from 'express';
import { verifySignature, handleCreateWebhook, handleListWebhooks } from '../routes';
import { WebhookConfig } from '../../../types/webhook';

// Mock the controller functions
vi.mock('../controller', () => ({
  createWebhook: vi.fn().mockResolvedValue({
    id: 'test-webhook-id',
    user_id: 'test-user',
    agent_id: 'test-agent',
    webhook_url: 'http://test.url/webhook',
    is_active: true
  }),
  listWebhooks: vi.fn().mockResolvedValue([{
    id: 'test-webhook-id',
    user_id: 'test-user',
    agent_id: 'test-agent',
    webhook_url: 'http://test.url/webhook',
    is_active: true
  }]),
  handleWebhookCall: vi.fn().mockResolvedValue({
    success: true,
    message: 'Webhook processed successfully',
    data: {
      response: 'Message received',
      agentId: 'test-agent',
      messageId: 'test-message',
      conversationId: 'test-conversation'
    },
    timestamp: new Date().toISOString()
  })
}));

// Mock Express Request and Response
const mockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    headers: {},
    get: vi.fn(),
    header: vi.fn(),
    accepts: vi.fn(),
    acceptsCharsets: vi.fn(),
    acceptsEncodings: vi.fn(),
    acceptsLanguages: vi.fn(),
    range: vi.fn(),
    ...overrides
  } as unknown as Request;
  return req;
};

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('Webhook Routes', () => {
  describe('verifySignature middleware', () => {
    it('should reject requests without signature', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = vi.fn();

      await verifySignature(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Missing webhook signature' 
      });
    });

    it('should call next() for valid signatures', async () => {
      const req = mockRequest({
        headers: {
          'x-webhook-signature': 'valid-signature'
        },
        params: {
          userId: 'test-user',
          agentId: 'test-agent'
        },
        body: {
          type: 'message',
          data: {
            id: 'test-id',
            content: 'test message',
            timestamp: new Date().toISOString()
          },
          source: 'ghl'
        }
      });
      const res = mockResponse();
      const next = vi.fn();

      await verifySignature(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('handleCreateWebhook', () => {
    it('should create webhook with valid data', async () => {
      const req = mockRequest({
        body: {
          userId: 'test-user',
          agentId: 'test-agent',
          config: {
            responseFormat: 'json',
            maxTokens: 100
          } as WebhookConfig
        }
      });
      const res = mockResponse();

      await handleCreateWebhook(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('handleListWebhooks', () => {
    it('should list webhooks for valid user', async () => {
      const req = mockRequest({
        params: {
          userId: 'test-user'
        }
      });
      const res = mockResponse();

      await handleListWebhooks(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });
}); 