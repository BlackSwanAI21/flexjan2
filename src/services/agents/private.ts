import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/agent';
import { fetchAgentById } from './queries';

export async function getAgent(id: string): Promise<Agent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await fetchAgentById(id, user.id);
  if (error) throw error;
  if (!data) throw new Error('Agent not found');
  return data;
}

export async function getAgents(): Promise<Agent[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveAgent(agent: Omit<Agent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Agent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('agents')
    .insert({
      user_id: user.id,
      assistant_id: agent.assistant_id,
      name: agent.name,
      model: agent.model,
      instructions: agent.instructions,
      first_message: agent.first_message
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAgent(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}