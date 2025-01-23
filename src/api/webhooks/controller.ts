import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { moderateWithGPT4 } from '../../services/openai/moderation';
import { withRetry } from '../../services/openai/retry';
import { initializePool, getPool } from '../../services/database/pool';
import { RateLimiter } from 'limiter';
import { updateGHLContact } from '../../services/ghl/api';

interface Location {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  fullAddress: string;
  id: string;
}

interface Contact {
  attributionSource: {
    sessionSource: string;
    medium: string;
    mediumId: null;
  };
  lastAttributionSource: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
}

interface CustomData {
  openai_key: string;
  ghl_api_key: string;
  Ghl_Location: string;
}

interface WebhookPayload {
  Memory?: string;
  'Chat GPT'?: string;
  'AI Memory'?: string;
  'Lead Response'?: string;
  'Call Back Time'?: string;
  Grade?: string;
  'Assistant Memory Id'?: string;
  Webhook?: string;
  'Active Assistant ID'?: string;
  'AI Additional Info'?: string;
  'Should Conversation Continue?'?: string;
  'AI Reason'?: string;
  'Analysis Prompt'?: string;
  Assistant_Id: string;
  Thread_Id?: string;
  'AI Moderation Reason'?: string;
  contact_id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  tags?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  date_created?: string;
  postal_code?: string;
  full_address?: string;
  contact_type?: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    fullAddress?: string;
    id?: string;
  };
  workflow?: {
    id?: string;
    name?: string;
  };
  triggerData?: Record<string, any>;
  contact?: {
    attributionSource?: {
      sessionSource?: string;
      medium?: string;
      mediumId?: string | null;
    };
    lastAttributionSource?: Record<string, any>;
  };
  attributionSource?: Record<string, any>;
  customData: {
    openai_key: string;
    ghl_api_key: string;
    Ghl_Location?: string;
  };
}

interface GHLPreferences {
  id?: string;
  preference_id?: string;
  assistant_id?: string;
  moderation_enabled?: boolean;
  moderation_prompt?: string;
  moderation_level?: 'light' | 'medium' | 'strict';
  time_detection_enabled?: boolean;
  timezone?: string;
  webhook_url?: string | null;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  thread_id?: string;
  status: 'blocked' | 'processed' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'incomplete' | 'expired';
  explanation?: string;
  booking_time?: string;
}

// Rate limiter: 1000 requests per minute = ~16.67 per second
const limiter = new RateLimiter({
  tokensPerInterval: 1000,
  interval: "minute"
});

// Load environment variables
dotenv.config();

// Log all environment variables that start with VITE_
console.log('Environment variables:', 
  Object.keys(process.env)
    .filter(key => !key.includes('KEY'))
    .reduce((acc, key) => ({
      ...acc,
      [key]: process.env[key]
    }), {})
);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  url: supabaseUrl
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

// Initialize the pool
initializePool(supabaseUrl, supabaseKey);

// Create a client with the service role key for admin operations
console.log('Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
console.log('Supabase client created');

function generateWebhookId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function createWebhook() {
  const webhookId = generateWebhookId();
  // Default to port 3000 since that's where our API server runs
  const baseUrl = process.env.VITE_WEBHOOK_LOCAL_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/webhook/${webhookId}`;

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      id: webhookId,
      webhook_url: webhookUrl,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listWebhooks() {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteWebhook(webhookId: string) {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId);

  if (error) throw error;
  return true;
}

export async function toggleWebhook(webhookId: string) {
  // First get the current state
  const { data: webhook, error: fetchError } = await supabase
    .from('webhooks')
    .select('is_active')
    .eq('id', webhookId)
    .single();

  if (fetchError) throw fetchError;

  // Toggle the state
  const { error: updateError } = await supabase
    .from('webhooks')
    .update({ is_active: !webhook.is_active })
    .eq('id', webhookId);

  if (updateError) throw updateError;
  return true;
}

// Add retry config for different operations
const RETRY_CONFIGS = {
  assistant: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 8000,
    backoffFactor: 2
  },
  moderation: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 2000,
    backoffFactor: 2
  }
};

// Add timeout constants
const REQUEST_TIMEOUT = 30000; // 30 seconds
const OPENAI_POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 20; // Maximum 20 attempts

export async function handleWebhookCall(rawPayload: any): Promise<WebhookResponse> {
  // Check rate limit first
  const hasCapacity = await limiter.tryRemoveTokens(1);
  if (!hasCapacity) {
    throw new Error('Rate limit exceeded');
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT);
  });

  try {
    // Log the full payload for debugging
    console.log('Raw payload received:', JSON.stringify(rawPayload, null, 2));

    // Race between webhook handling and timeout
    return await Promise.race([
      processWebhook(rawPayload),
      timeoutPromise
    ]);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    if (error?.message === 'Request timeout') {
      return {
        success: false,
        message: 'Request timed out',
        status: 'failed',
        explanation: 'Request exceeded maximum processing time'
      };
    }
    throw error;
  }
}

async function processWebhook(payload: any): Promise<WebhookResponse> {
  // Log the incoming payload structure
  console.log('Processing webhook with payload:', {
    leadResponse: payload?.['Lead Response'],
    aiMemory: payload?.['AI Memory'],
    assistantId: payload?.Assistant_Id,
    threadId: payload?.Thread_Id,
    contactId: payload?.contact_id,
    hasCustomData: !!payload?.customData,
    customDataKeys: payload?.customData ? Object.keys(payload.customData) : []
  });

  // Extract contact details early
  const email = payload.email;
  const phone = payload.phone;

  if (!email && !phone) {
    console.warn('No email or phone number provided in payload');
  }

  // Get database client from pool
  const pool = getPool();

  // Validate payload structure
  if (!payload) {
    console.error('Payload is null or undefined');
    throw new Error('No payload provided');
  }

  // Log the raw payload for debugging
  console.log('Raw payload:', JSON.stringify(payload, null, 2));

  // Validate customData exists and has required fields
  if (!payload.customData) {
    console.error('Missing customData in payload:', payload);
    throw new Error('Missing customData in payload');
  }

  // Log customData for debugging
  console.log('CustomData received:', payload.customData);

  // Validate required fields
  const missingFields = [];
  if (!payload.customData.openai_key) missingFields.push('customData.openai_key');
  if (!payload.Assistant_Id) missingFields.push('Assistant_Id');
  if (!payload.customData.ghl_api_key) missingFields.push('customData.ghl_api_key');

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Extract fields after validation
  const leadResponse = payload['Lead Response'] || '';
  const aiMemory = payload['AI Memory'] || '';
  const assistantId = payload.Assistant_Id;
  const threadId = payload.Thread_Id;
  const contactId = payload.contact_id;
  const { openai_key: openAiKey, ghl_api_key: ghlApiKey, Ghl_Location: ghlLocation } = payload.customData;

  // Get preferences for this assistant
  const preferences = await pool.getPreferences(assistantId);
  console.log('Found preferences:', preferences);

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: openAiKey });
  
  // Initialize response
  let responseMessageContent = '';
  let moderationResult = { allowed: true, explanation: 'No moderation performed' };

  try {
    console.log('Starting OpenAI interaction...');
    
    // Create a new thread if one doesn't exist
    const thread = threadId ? { id: threadId } : await openai.beta.threads.create();
    console.log('Using thread:', thread.id);

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: leadResponse
    });
    console.log('Added user message to thread');

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    console.log('Started assistant run:', run.id);

    // Poll for completion
    let completedRun;
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      completedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (completedRun.status === 'completed') {
        break;
      } else if (completedRun.status === 'failed' || completedRun.status === 'cancelled') {
        throw new Error(`Assistant run ${completedRun.status}: ${completedRun.last_error?.message || 'Unknown error'}`);
      }
      await new Promise(resolve => setTimeout(resolve, OPENAI_POLL_INTERVAL));
    }

    if (!completedRun || completedRun.status !== 'completed') {
      throw new Error('Assistant run timed out');
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];
    responseMessageContent = lastMessage.content[0].type === 'text' ? lastMessage.content[0].text.value : '';
    console.log('Received assistant response:', responseMessageContent);

  } catch (error: any) {
    console.error('OpenAI interaction failed:', error);
    throw new Error(`Failed to get assistant response: ${error.message}`);
  }

  // Process based on preferences
  if (preferences?.moderation_enabled && preferences.moderation_prompt) {
    console.log(`Moderation enabled with level: ${preferences.moderation_level}`);
    try {
      moderationResult = await moderateWithGPT4(
        openAiKey,
        preferences.moderation_prompt,
        aiMemory
      );
      console.log('Moderation completed:', moderationResult);
    } catch (error) {
      console.error('Moderation failed:', error);
      throw new Error('Failed to perform content moderation');
    }
  }

  // Build response
  const response: WebhookResponse = {
    success: true,
    message: responseMessageContent || leadResponse || '',
    thread_id: threadId,
    status: 'processed',
    explanation: moderationResult.explanation
  };

  // Add time detection if enabled
  if (preferences?.time_detection_enabled && preferences.timezone) {
    console.log('Starting time detection...');
    try {
      const timeDetectionModule = await import('../../services/timeDetection');
      const timeDetectionResult = await timeDetectionModule.processTimeDetection(
        responseMessageContent || leadResponse || '',
        preferences.timezone,
        aiMemory,
        openAiKey
      );

      console.log('Time detection result:', timeDetectionResult);

      if (timeDetectionResult.detectedTime) {
        // Explicitly assign the detected time to the response
        response.booking_time = timeDetectionResult.detectedTime;
        console.log('Added booking time to response:', response.booking_time);
      } else {
        console.log('No booking time detected');
      }
    } catch (error) {
      console.error('Time detection failed:', error);
      // Continue without time detection
    }
  }

  // After all processing is complete and before returning the response
  try {
    await updateGHLContact(ghlApiKey, {
      email,
      phone,
      customField: {
        chat_gpt: responseMessageContent,
        thread_id: threadId || '',
        ai_moderation_reason: moderationResult.explanation,
        call_back_time: response.booking_time
      }
    });
  } catch (error) {
    console.error('Failed to update GHL contact:', error);
    // Don't throw error here - we still want to return the webhook response
  }

  console.log('Returning response:', response);
  return response;
} 