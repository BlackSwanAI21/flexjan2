import { useState, useEffect } from 'react';
import { CONVERSATION_STAGES } from '../constants/conversation';
import { hasUserResponse, hasQualifyingKeywords, hasCompletionKeywords } from '../utils/conversation';
import type { Message } from '../services/chat/types';

export type ConversationStage = typeof CONVERSATION_STAGES[keyof typeof CONVERSATION_STAGES];

export function useConversationProgress(messages: Message[]) {
  const [stage, setStage] = useState<ConversationStage>(CONVERSATION_STAGES.NEW);

  useEffect(() => {
    if (messages.length === 0) {
      setStage(CONVERSATION_STAGES.NEW);
      return;
    }

    if (!hasUserResponse(messages)) {
      setStage(CONVERSATION_STAGES.NEW);
      return;
    }

    // Check completion first
    const hasCompletion = messages.some(msg => hasCompletionKeywords(msg.content));
    if (hasCompletion) {
      setStage(CONVERSATION_STAGES.COMPLETED);
      return;
    }

    // Then check qualification
    const hasQualification = messages.some(msg => hasQualifyingKeywords(msg.content));
    if (hasQualification) {
      setStage(CONVERSATION_STAGES.QUALIFIED);
      return;
    }

    // Default to responded if user has messaged but no other conditions met
    setStage(CONVERSATION_STAGES.RESPONDED);
  }, [messages]);

  return stage;
}