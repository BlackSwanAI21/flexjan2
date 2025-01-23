import { supabase } from '../lib/supabase';

export interface ShareUrl {
  id: string;
  agent_id: string;
  url_token: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  impersonated_user_id: string;
}

export async function createShareUrl(agentId: string, expiresAt?: Date): Promise<ShareUrl> {
  console.log('Creating share URL for agent:', agentId);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, generate a unique token using the RPC function
  const { data: token, error: tokenError } = await supabase
    .rpc('generate_unique_url_token');

  console.log('Token generation result:', { token, tokenError });

  if (tokenError) {
    console.error('Error generating token:', tokenError);
    throw new Error('Failed to generate share URL token');
  }

  if (!token) {
    console.error('No token generated');
    throw new Error('Failed to generate share URL token');
  }

  // Create share URL with the generated token
  const { data, error } = await supabase
    .from('shared_agent_urls')
    .insert({
      agent_id: agentId,
      url_token: token,
      expires_at: expiresAt?.toISOString(),
      created_by: user.id,
      impersonated_user_id: user.id, // Set this to the current user's ID
      is_active: true
    })
    .select()
    .single();

  console.log('Share URL creation result:', { data, error });

  if (error) {
    console.error('Error creating share URL:', error);
    throw new Error('Failed to create share URL');
  }

  if (!data) {
    console.error('No share URL data returned');
    throw new Error('Failed to create share URL');
  }

  return data;
}

export async function getShareUrls(agentId: string): Promise<ShareUrl[]> {
  const { data, error } = await supabase
    .from('shared_agent_urls')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deactivateShareUrl(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('shared_agent_urls')
    .update({ is_active: false })
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deactivating share URL:', error);
    throw new Error('Failed to deactivate share URL');
  }
}