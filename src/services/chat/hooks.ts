import { useState, useCallback, useEffect, useRef } from 'react';
import { createThread, addMessage, runAssistant, getRunStatus, getMessages } from './api';
import type { Message } from './types';

// Constants for polling configuration
const POLL_INTERVAL = 300;
const MAX_POLL_ATTEMPTS = 100;

export function useChat(assistantId: string | undefined, saveMessageToDb?: (message: Message) => Promise<void>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const initAttempts = useRef(0);
  const maxAttempts = 3;
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const initializeThread = async () => {
    if (!assistantId) return;
    
    console.log('[useChat] Initializing thread for assistant:', assistantId);
    setIsInitializing(true);
    setMessages([]);
    setError(null);
    
    try {
      const thread = await createThread();
      console.log('[useChat] Thread created:', thread);
      setThreadId(thread.id);
      initAttempts.current = 0; // Reset attempts on success
    } catch (err) {
      console.error('[useChat] Thread initialization error:', err);
      if (initAttempts.current < maxAttempts) {
        initAttempts.current++;
        // Retry after a delay
        setTimeout(initializeThread, 1000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const pollRunStatus = useCallback(async (threadId: string, runId: string): Promise<Message | undefined> => {
    let attempts = 0;
    console.log('[useChat] Starting to poll run status for runId:', runId);

    while (attempts < MAX_POLL_ATTEMPTS) {
      const status = await getRunStatus(threadId, runId);
      console.log('[useChat] Poll attempt', attempts + 1, 'status:', status.status);

      if (status.status === 'completed') {
        const messagesResponse = await getMessages(threadId);
        const latestMessage = messagesResponse.data.find(
          msg => msg.run_id === runId && msg.role === 'assistant'
        );
        
        if (latestMessage?.content[0]?.text?.value) {
          console.log('[useChat] Found completed AI message:', {
            runId,
            content: latestMessage.content[0].text.value.substring(0, 50) + '...'
          });
          return {
            role: 'assistant',
            content: latestMessage.content[0].text.value
          };
        }
        return;
      }

      if (status.status === 'failed' || status.status === 'expired') {
        console.error('[useChat] Run failed or expired:', status);
        throw new Error('Assistant failed to respond');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error('Response timeout exceeded');
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<Message | undefined> => {
    if (!assistantId || !threadId) return;
    
    console.log('[useChat] Sending message:', { content: content.substring(0, 50) + '...' });
    setError(null);
    setIsLoading(true);

    try {
      // Add user message immediately
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);
      console.log('[useChat] Added user message to state');

      // Send message to API
      await addMessage(threadId, content);
      const run = await runAssistant(threadId, assistantId);
      console.log('[useChat] Started assistant run:', run.id);
      
      // Set current run ID to track active response
      setCurrentRunId(run.id);

      const response = await pollRunStatus(threadId, run.id);
      if (response) {
        console.log('[useChat] Received AI response:', {
          content: response.content.substring(0, 50) + '...'
        });
        setMessages(prev => [...prev, response]);
        
        // Save AI response to database
        if (saveMessageToDb) {
          console.log('[useChat] Saving AI response to database');
          try {
            await saveMessageToDb(response);
            console.log('[useChat] AI response saved successfully');
          } catch (err) {
            console.error('[useChat] Failed to save AI response:', err);
          }
        }
      }
      return response;
    } catch (err) {
      console.error('[useChat] Error in sendMessage:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove any partial assistant messages for the current run
      setMessages(prev => 
        prev.filter(msg => msg.role !== 'assistant' || msg.run_id !== currentRunId)
      );
      setCurrentRunId(null);
    } finally {
      setIsLoading(false);
    }
  }, [threadId, assistantId, currentRunId, pollRunStatus, saveMessageToDb]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshChat = useCallback(() => {
    initializeThread();
  }, []);

  useEffect(() => {
    if (assistantId) {
      console.log('[useChat] Assistant ID changed, initializing thread');
      initializeThread();
    }
  }, [assistantId]);

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearError,
    refreshChat
  };
}