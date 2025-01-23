import { describe, it, expect, vi } from 'vitest';
import { verifyWebhookSignature, generateWebhookUrl, retryWebhook, WebhookError } from '../webhook';
import { WebhookErrorType } from '../../types/webhook';

describe('Webhook Utilities', () => {
  describe('verifyWebhookSignature', () => {
    it('should verify valid signatures', () => {
      const secret = 'test_secret';
      const payload = JSON.stringify({ test: 'data' });
      const signature = require('crypto')
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      expect(verifyWebhookSignature(signature, payload, secret)).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const secret = 'test_secret';
      const payload = JSON.stringify({ test: 'data' });
      const invalidSignature = 'invalid_signature';

      expect(() => verifyWebhookSignature(invalidSignature, payload, secret))
        .toThrow(WebhookError);
    });
  });

  describe('generateWebhookUrl', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should generate valid webhook URLs', () => {
      const userId = 'test-user';
      const agentId = 'test-agent';
      const url = generateWebhookUrl(userId, agentId);

      expect(url).toContain('/api/webhook/');
      expect(url).toContain(userId);
      expect(url).toContain(agentId);
      expect(url.split('/').pop()?.length).toBe(32); // Check uniqueId length
    });
  });

  describe('retryWebhook', () => {
    it('should retry failed operations', async () => {
      const mockFn = vi.fn();
      let attempts = 0;
      
      mockFn.mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          throw new WebhookError(
            'Test error',
            WebhookErrorType.PROCESSING_ERROR,
            500,
            true
          );
        }
        return Promise.resolve('success');
      });

      const result = await retryWebhook(mockFn);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(
        new WebhookError(
          'Non-retryable error',
          WebhookErrorType.INVALID_SIGNATURE,
          401,
          false
        )
      );

      await expect(retryWebhook(mockFn))
        .rejects
        .toThrow(WebhookError);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
}); 