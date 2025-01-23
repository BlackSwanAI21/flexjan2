import { supabase } from '../../lib/supabase';
import type { Message } from '../chat/types';

export async function saveMessage(conversationId: string, message: Message) {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content
        });

      if (error) throw error;
      return;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
    }
  }

  console.error('Error saving message:', lastError);
  throw lastError;
}