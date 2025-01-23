import { supabase } from '../../lib/supabase';
import type { Message } from '../chat/types';

interface ConversationOptions {
  shared_token?: string;
  thread_id?: string;
}

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  { maxAttempts = 3, delayMs = 1000, backoffFactor = 2 }: RetryOptions = {}
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxAttempts}`);
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Attempt ${attempt} failed:`, lastError);
      
      if (attempt === maxAttempts) break;
      
      // Exponential backoff
      const delay = delayMs * Math.pow(backoffFactor, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function createPersistedConversation(agentId: string, options: ConversationOptions = {}) {
  console.log('Creating persisted conversation:', { agentId, options });
  
  return retryOperation(async () => {
    // Set share token if provided
    if (options.shared_token) {
      console.log('Setting share token in database context:', options.shared_token);
      await supabase.rpc('set_share_token', { share_token: options.shared_token });
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        agent_id: agentId,
        shared_token: options.shared_token,
        thread_id: options.thread_id,
        is_shared: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    if (!data) {
      throw new Error('No data returned from conversation creation');
    }
    
    console.log('Conversation created successfully:', data);
    return data;
  });
}

export async function persistMessage(conversationId: string, message: Message) {
  console.log('Persisting message:', { conversationId, message });
  
  return retryOperation(async () => {
    // Get conversation details to check if it's shared
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('shared_token')
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Failed to get conversation:', convError);
      throw convError;
    }

    // Set share token if conversation is shared
    if (conversation?.shared_token) {
      await supabase.rpc('set_share_token', { share_token: conversation.shared_token });
    }

    const { error } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content
      });

    if (error) {
      console.error('Failed to persist message:', error);
      throw error;
    }
    
    console.log('Message persisted successfully');
  });
}

export async function getConversation(conversationId: string) {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Conversation not found');
    
    return data;
  });
}