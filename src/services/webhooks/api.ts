import { supabase } from '../../lib/supabaseClient';

export interface Webhook {
  id: string;
  user_id: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_request?: {
    timestamp: string;
    payload: any;
  };
}

export async function createWebhook(): Promise<Webhook> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('webhooks')
    .insert({
      user_id: user.id,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create webhook: ${error.message}`);
  }

  return data;
}

export async function listWebhooks(): Promise<Webhook[]> {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list webhooks: ${error.message}`);
  }

  return data || [];
}

export async function toggleWebhook(webhookId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('webhooks')
    .update({ is_active: isActive })
    .eq('id', webhookId);

  if (error) {
    throw new Error(`Failed to toggle webhook: ${error.message}`);
  }
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', webhookId);

  if (error) {
    throw new Error(`Failed to delete webhook: ${error.message}`);
  }
} 