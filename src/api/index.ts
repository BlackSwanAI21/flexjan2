import { Router } from 'express';
import {
  handleCreateWebhook,
  handleListWebhooks,
  handleDeleteWebhook,
  handleToggleWebhook,
  handleWebhookRequest,
  verifySignature
} from './webhooks/routes';

const router = Router();

// Webhook management endpoints
router.post('/webhooks/create', handleCreateWebhook);
router.get('/webhooks/list', handleListWebhooks);
router.delete('/webhooks/:webhookId', handleDeleteWebhook);
router.put('/webhooks/:webhookId/toggle', handleToggleWebhook);

// Webhook receiver endpoint
router.post('/webhook/:webhookId', handleWebhookRequest);

export default router; 