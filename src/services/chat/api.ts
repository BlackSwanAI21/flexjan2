import { supabase } from '../../lib/supabase';
import type { Thread, Run, ThreadMessage } from './types';

const BASE_URL = 'https://api.openai.com/v1';
const API_VERSION = 'assistants=v2';

// Cache for API keys
const apiKeyCache: { [key: string]: string } = {};

async function getAuthenticatedApiKey(): Promise<string> {
  try {
    // First try to get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
    }

    // If we have an authenticated user, try to get their API key
    if (user) {
      const cacheKey = `user-${user.id}`;
      
      // Check cache first
      if (apiKeyCache[cacheKey]) {
        return apiKeyCache[cacheKey];
      }

      const { data: keys, error: keyError } = await supabase
        .from('api_keys')
        .select('key_hash')
        .eq('user_id', user.id)
        .single();

      if (keyError) {
        console.error('Error fetching user API key:', keyError);
      }

      if (keys?.key_hash) {
        // Cache the API key
        apiKeyCache[cacheKey] = keys.key_hash;
        return keys.key_hash;
      }
    }

    // If no authenticated user or no API key found, try share token path
    const shareToken = getShareToken();
    if (shareToken) {
      // Check cache first
      if (apiKeyCache[shareToken]) {
        return apiKeyCache[shareToken];
      }

      // Set the share token in the session
      await supabase.rpc('set_share_token', { share_token: shareToken });
      
      // Try to get the API key with share token context
      const { data: keys, error: shareKeyError } = await supabase
        .from('api_keys')
        .select('key_hash')
        .single();

      if (shareKeyError) {
        console.error('Error fetching shared API key:', shareKeyError);
      }
        
      if (keys?.key_hash) {
        // Cache the API key
        apiKeyCache[shareToken] = keys.key_hash;
        return keys.key_hash;
      }
    }

    throw new Error('OpenAI API key not found');
  } catch (error) {
    console.error('Error in getAuthenticatedApiKey:', error);
    throw new Error('OpenAI API key not found');
  }
}

// Optimize polling interval and max attempts
const POLL_INTERVAL = 500; // Poll every 500ms instead of 1000ms
const MAX_POLL_ATTEMPTS = 60; // Allow more attempts but with shorter intervals

async function fetchWithRetry<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3
): Promise<T> {
  const apiKey = await getAuthenticatedApiKey();
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'OpenAI-Beta': API_VERSION,
          'Authorization': `Bearer ${apiKey}`,
          ...options.headers,
        },
      });

      // If we get a 502, we want to retry
      if (response.status === 502) {
        console.log(`Received 502 error, attempt ${attempt + 1} of ${maxRetries}`);
        lastError = new Error('OpenAI Gateway Error');
        // Wait longer between each retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt === maxRetries - 1) throw lastError;
      // Wait before retrying other errors too
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw lastError!;
}

export async function createThread(): Promise<Thread> {
  return fetchWithRetry('/threads', { method: 'POST' });
}

export async function addMessage(threadId: string, content: string): Promise<ThreadMessage> {
  return fetchWithRetry(`/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content }),
  });
}

export async function runAssistant(threadId: string, assistantId: string): Promise<Run> {
  return fetchWithRetry(`/threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({ assistant_id: assistantId }),
  });
}

export async function getRunStatus(threadId: string, runId: string): Promise<Run> {
  return fetchWithRetry(`/threads/${threadId}/runs/${runId}`);
}

export async function getMessages(threadId: string): Promise<{ data: ThreadMessage[] }> {
  return fetchWithRetry(`/threads/${threadId}/messages`);
}

function getShareToken(): string {
  // First try from query param
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromQuery = urlParams.get('token');
  if (tokenFromQuery) return tokenFromQuery;
  
  // Then try from path
  const pathParts = window.location.pathname.split('/');
  const sharedIndex = pathParts.indexOf('shared');
  if (sharedIndex !== -1 && pathParts[sharedIndex + 1]) {
    return pathParts[sharedIndex + 1];
  }
  
  return '';
}