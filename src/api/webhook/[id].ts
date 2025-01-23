import { supabase } from '../../lib/supabase';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const webhookId = url.pathname.split('/').pop();
  const requestBody = await req.json();
  const timestamp = new Date().toISOString();

  console.log('Received webhook request:', {
    webhookId,
    url: url.toString(),
    pathname: url.pathname
  });

  try {
    // First, let's see what webhooks exist
    const { data: allWebhooks, error: listError } = await supabase
      .from('webhooks')
      .select('*');
    
    console.log('All webhooks:', allWebhooks);
    console.log('List error:', listError);

    // Find the webhook by ID portion only
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .like('webhook_url', `%${webhookId}`)
      .single();

    console.log('Webhook search result:', {
      webhook,
      error: webhookError,
      searchPattern: `%${webhookId}`
    });

    if (webhookError || !webhook) {
      console.error('Webhook not found:', webhookError);
      return new Response(JSON.stringify({ error: 'Webhook not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return success
    return new Response(JSON.stringify({ 
      message: 'Webhook received successfully',
      timestamp
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 