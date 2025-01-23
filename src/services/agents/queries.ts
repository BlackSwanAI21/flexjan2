import { supabase } from '../../lib/supabase';
import type { Agent } from '../../types/agent';
import type { AgentResponse } from './types';

export async function fetchAgentById(id: string, userId?: string): Promise<AgentResponse> {
  try {
    const query = supabase
      .from('agents')
      .select('*')
      .eq('id', id);
    
    if (userId) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to fetch agent')
    };
  }
}