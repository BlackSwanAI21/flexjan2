import { Request, Response, Router, RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { 
  createWebhook, 
  listWebhooks, 
  deleteWebhook, 
  toggleWebhook,
  handleWebhookCall 
} from './controller';

const router = Router();

// Rate limiting middleware
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all webhook endpoints
router.use(webhookLimiter);

// Route handlers
const handleCreateWebhookRoute: RequestHandler = async (req, res, next) => {
  try {
    const webhook = await createWebhook();
    res.status(201).json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ 
      error: 'Failed to create webhook' 
    });
  }
};

const handleListWebhooksRoute: RequestHandler = async (req, res, next) => {
  try {
    const webhooks = await listWebhooks();
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list webhooks' 
    });
  }
};

const handleDeleteWebhookRoute: RequestHandler = async (req, res, next) => {
  try {
    const { webhookId } = req.params;
    await deleteWebhook(webhookId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete webhook' 
    });
  }
};

const handleToggleWebhookRoute: RequestHandler = async (req, res, next) => {
  try {
    const { webhookId } = req.params;
    await toggleWebhook(webhookId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to toggle webhook' 
    });
  }
};

const handleWebhookRequestRoute: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log('Received webhook request:');
    console.log('- URL:', req.url);
    console.log('- Method:', req.method);
    console.log('- Headers:', req.headers);
    console.log('- Body:', req.body);
    console.log('- Params:', req.params);

    const webhookId = req.params.webhookId;
    console.log('Extracted webhookId:', webhookId);

    // Pass only the request body to handleWebhookCall
    const result = await handleWebhookCall(req.body);
    
    // Send back the full response from the controller
    res.json(result);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error.message 
    });
  }
};

// Register routes
router.post('/webhooks/create', handleCreateWebhookRoute);
router.get('/webhooks/list', handleListWebhooksRoute);
router.delete('/webhooks/:webhookId', handleDeleteWebhookRoute);
router.put('/webhooks/:webhookId/toggle', handleToggleWebhookRoute);
router.post('/webhook/:webhookId', handleWebhookRequestRoute);

export default router; 