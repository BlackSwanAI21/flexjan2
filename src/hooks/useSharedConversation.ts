import { useState, useCallback, useEffect } from 'react';
import { createPersistedConversation, persistMessage } from '../services/conversations/persistence';
import type { Message } from '../services/chat/types';

export function useSharedConversation(agentId: string | undefined, shareToken: string | undefined) {
  const [conversationId, setConversationId] = useState<string>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeConversation = useCallback(async () => {
    if (!agentId || !shareToken) {
      console.log('Missing required params:', { agentId, shareToken });
      return;
    }
    
    try {
      console.log('Initializing shared conversation:', { agentId, shareToken });
      const conversation = await createPersistedConversation(agentId, {
        shared_token: shareToken
      });
      console.log('Conversation created:', conversation);
      setConversationId(conversation.id);
      return conversation.id;
    } catch (err) {
      console.error('Failed to create shared conversation:', err);
      const message = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(message);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [agentId, shareToken]);

  const saveMessageToDb = useCallback(async (message: Message) => {
    console.log('Attempting to save message:', { conversationId, message });
    if (!conversationId) {
      console.log('No conversationId available');
      return;
    }

    try {
      await persistMessage(conversationId, message);
      console.log('Message saved successfully');
    } catch (err) {
      console.error('Failed to save message:', err);
      // Don't throw - we want chat to continue even if persistence fails
    }
  }, [conversationId]);

  useEffect(() => {
    if (agentId && shareToken && !conversationId) {
      console.log('Auto-initializing conversation');
      initializeConversation().catch(console.error);
    }
  }, [agentId, shareToken, conversationId, initializeConversation]);

  return {
    conversationId,
    isInitializing,
    error,
    saveMessageToDb
  };
}