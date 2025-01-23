import { supabase } from '../../lib/supabase';
import { generateSessionId } from '../../utils/session';
import { getShareToken } from './utils';
import type { Conversation } from './types';

export async function createConversation(agentId: string): Promise<Conversation> {
  const sessionId = generateSessionId();
  const shareToken = getShareToken();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Prepare conversation data
    const conversationData: any = {
      agent_id: agentId,
      session_id: sessionId
    };

    // Add user_id if authenticated
    if (user) {
      conversationData.user_id = user.id;
    }

    // Add shared_token if in shared context
    if (shareToken) {
      conversationData.shared_token = shareToken;
    }

    // Create the conversation with retries
    const maxRetries = 3;
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert(conversationData)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('No data returned from conversation creation');
        
        return data;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
}