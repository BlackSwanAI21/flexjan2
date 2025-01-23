import { useState, useEffect } from 'react';
import { isTerminationMessage } from '../utils/conversation';
import type { Message } from '../services/chat/types';

export function useConversationTermination(messages: Message[]) {
  const [isTerminated, setIsTerminated] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      setIsTerminated(false);
      return;
    }

    const hasGoodbye = messages.some(isTerminationMessage);
    setIsTerminated(hasGoodbye);
  }, [messages]);

  return isTerminated;
}