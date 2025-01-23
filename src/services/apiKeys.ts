import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type ApiKey = Database['public']['Tables']['api_keys']['Row'];

export async function getApiKey(): Promise<string | null> {
  try {
    // Get current user for debugging
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('[getApiKey] Auth state:', {
      isAuthenticated: !!user,
      userId: user?.id
    });

    if (userError) {
      console.error('[getApiKey] Auth error:', userError);
      return null;
    }

    // If authenticated, first try direct query with user_id
    if (user) {
      const { data: directData, error: directError } = await supabase
        .from('api_keys')
        .select('key_hash')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[getApiKey] Direct query result:', {
        found: !!directData,
        error: directError?.message
      });

      if (directData?.key_hash) {
        return directData.key_hash;
      }
    }

    // If no direct match or not authenticated, try share token path
    const shareToken = window.location.pathname.split('/shared/')[1];
    if (shareToken) {
      console.log('[getApiKey] Attempting share token path:', { shareToken });
      
      // Set the share token in the session
      const { error: rpcError } = await supabase.rpc('set_share_token', {
        share_token: shareToken
      });

      if (rpcError) {
        console.error('[getApiKey] RPC error:', rpcError);
      }

      // Try to get the API key with share token context
      const { data: shareData, error: shareError } = await supabase
        .from('api_keys')
        .select('key_hash')
        .single();

      console.log('[getApiKey] Share token query result:', {
        found: !!shareData,
        error: shareError?.message
      });

      if (shareData?.key_hash) {
        return shareData.key_hash;
      }
    }

    console.log('[getApiKey] No API key found through any method');
    return null;
  } catch (error) {
    console.error('[getApiKey] Unexpected error:', error);
    return null;
  }
}

export async function saveApiKey(apiKey: string): Promise<boolean> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Not authenticated');

    console.log('[saveApiKey] Attempting to save for user:', user.id);

    // Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[saveApiKey] Profile error:', profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error('Profile not found. Please try logging out and back in.');
    }

    // Check for existing key
    const { data: existingKey, error: existingKeyError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingKeyError) {
      console.error('[saveApiKey] Existing key check error:', existingKeyError);
      throw existingKeyError;
    }

    if (existingKey) {
      console.log('[saveApiKey] Updating existing key');
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ key_hash: apiKey })
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('[saveApiKey] Update error:', updateError);
        throw updateError;
      }
    } else {
      console.log('[saveApiKey] Inserting new key');
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({ user_id: user.id, key_hash: apiKey });
      
      if (insertError) {
        console.error('[saveApiKey] Insert error:', insertError);
        throw insertError;
      }
    }
    
    console.log('[saveApiKey] Successfully saved API key');
    return true;
  } catch (error) {
    console.error('[saveApiKey] Operation failed:', error);
    throw error;
  }
}