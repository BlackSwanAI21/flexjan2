import { getApiKey } from '../../apiKeys';
import { supabase } from '../../../lib/supabase';

// Cache for API keys
const API_KEY_CACHE = new Map<string, string>();

export async function getAuthenticatedApiKey(): Promise<string> {
  try {
    // First try to get API key for authenticated user
    let apiKey = await getApiKey();
    
    if (!apiKey) {
      // If no authenticated user API key, try to get from share token
      const shareToken = window.location.pathname.split('/shared/')[1];
                      
      if (shareToken) {
        // Check cache first
        const cachedKey = API_KEY_CACHE.get(shareToken);
        if (cachedKey) {
          return cachedKey;
        }

        // Implement retry logic
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
          try {
            // Set the share token in the session
            await supabase.rpc('set_share_token', { share_token: shareToken });
            
            // Add a delay to ensure token is set
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Try to get the API key
            const { data: keys, error } = await supabase
              .from('api_keys')
              .select('key_hash')
              .single();
            
            if (error) {
              console.error(`Attempt ${i + 1} failed:`, error);
              if (i < maxRetries - 1) {
                // Wait longer between retries
                await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
                continue;
              }
              throw error;
            }
            
            if (keys?.key_hash) {
              apiKey = keys.key_hash;
              // Cache the API key
              API_KEY_CACHE.set(shareToken, apiKey);
              break;
            }
          } catch (error) {
            if (i === maxRetries - 1) {
              throw error;
            }
          }
        }
      }
    }

    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    return apiKey;
  } catch (error) {
    console.error('Error in getAuthenticatedApiKey:', error);
    throw error;
  }
}