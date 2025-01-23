import { useState, useCallback, useEffect } from 'react';
import { createConversation, saveMessage } from '../services/conversations';
import { getOrCreateSessionId } from '../utils/session';
import type { Message } from '../services/chat/types';

export function useConversation(agentId: string | undefined) {
  const [conversationId, setConversationId] = useState<string>();
  const sessionId = getOrCreateSessionId();

  const initializeConversation = useCallback(async () => {
    if (!agentId) return;
    
    try {
      console.log('[useConversation] Initializing conversation for agent:', agentId);
      const conversation = await createConversation(agentId);
      console.log('[useConversation] Conversation created:', conversation);
      setConversationId(conversation.id);
      return conversation.id;
    } catch (error) {
      console.error('[useConversation] Failed to create conversation:', error);
    }
  }, [agentId]);

  const saveMessageToDb = useCallback(async (message: Message, convId?: string) => {
    const id = convId || conversationId;
    console.log('[useConversation] Attempting to save message:', {
      conversationId: id,
      role: message.role,
      contentPreview: message.content.substring(0, 50) + '...'
    });

    if (!id) {
      console.log('[useConversation] No conversation ID available, skipping save');
      return;
    }

    try {
      await saveMessage(id, message);
      console.log('[useConversation] Message saved successfully');
    } catch (error) {
      console.error('[useConversation] Failed to save message:', error);
    }
  }, [conversationId]);

  useEffect(() => {
    if (agentId && !conversationId) {
      console.log('[useConversation] No conversation ID found, initializing');
      initializeConversation();
    }
  }, [agentId, conversationId, initializeConversation]);

  return {
    conversationId,
    sessionId,
    initializeConversation,
    saveMessageToDb
  };
}