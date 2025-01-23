import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/agent';
import { fetchAgentById } from './queries';

export async function getPublicAgent(token: string): Promise<Agent> {
  console.log('getPublicAgent called with token:', token);
  
  // Set the share token in the session first
  await supabase.rpc('set_share_token', { share_token: token });
  
  // Query for active share URLs that haven't expired
  const { data: shareUrl, error: shareError } = await supabase
    .from('shared_agent_urls')
    .select('*')
    .eq('url_token', token)
    .eq('is_active', true)
    .single();

  console.log('Share URL query result:', { shareUrl, shareError });

  if (shareError) {
    console.error('Share URL error:', shareError);
    throw new Error('Invalid or expired share link');
  }

  if (!shareUrl) {
    console.error('No share URL found for token:', token);
    throw new Error('Share link not found');
  }

  // Check if URL has expired
  if (shareUrl.expires_at && new Date(shareUrl.expires_at) < new Date()) {
    console.error('Share URL has expired:', shareUrl.expires_at);
    throw new Error('Share link has expired');
  }

  const { data: agent, error: agentError } = await fetchAgentById(shareUrl.agent_id);
  console.log('Agent query result:', { agent, agentError });

  if (agentError) {
    console.error('Agent fetch error:', agentError);
    throw agentError;
  }

  if (!agent) {
    console.error('No agent found with ID:', shareUrl.agent_id);
    throw new Error('Agent no longer exists');
  }

  return agent;
}