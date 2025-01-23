import { getAuthenticatedApiKey } from './auth';

const BASE_URL = 'https://api.openai.com/v1';
const API_VERSION = 'assistants=v2';

let cachedApiKey: string | null = null;

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Use cached API key if available, otherwise fetch and cache it
    if (!cachedApiKey) {
      cachedApiKey = await getAuthenticatedApiKey();
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': API_VERSION,
        'Authorization': `Bearer ${cachedApiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Clear cached API key on auth errors
      if (response.status === 401) {
        cachedApiKey = null;
      }
      
      const error = await response.json();
      throw new Error(error.error?.message || `API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Clear cached API key on any errors
    cachedApiKey = null;
    throw error;
  }
}