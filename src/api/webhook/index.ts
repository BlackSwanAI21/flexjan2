import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

export const handleWebhook = async (req: Request, res: Response) => {
  const webhookId = req.params.id;
  const requestBody = req.body;
  const timestamp = new Date().toISOString();

  try {
    // Find the webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('webhook_url', `${req.protocol}://${req.get('host')}/api/webhook/${webhookId}`)
      .single();

    if (webhookError || !webhook) {
      console.error('Webhook not found:', webhookError);
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // Store the request for display
    const { error: updateError } = await supabase
      .from('webhooks')
      .update({
        last_request: {
          timestamp,
          body: requestBody
        }
      })
      .eq('id', webhook.id);

    if (updateError) {
      console.error('Error storing webhook request:', updateError);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }

    // Return success
    return res.status(200).json({ 
      message: 'Webhook received successfully',
      timestamp
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 