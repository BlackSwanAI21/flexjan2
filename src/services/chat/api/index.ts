import { fetchWithAuth } from './fetch';
import type { Thread, Run, ThreadMessage } from '../types';

export async function createThread(): Promise<Thread> {
  return fetchWithAuth('/threads', { method: 'POST' });
}

export async function addMessage(threadId: string, content: string): Promise<ThreadMessage> {
  return fetchWithAuth(`/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role: 'user', content }),
  });
}

export async function runAssistant(threadId: string, assistantId: string): Promise<Run> {
  return fetchWithAuth(`/threads/${threadId}/runs`, {
    method: 'POST',
    body: JSON.stringify({ assistant_id: assistantId }),
  });
}

export async function getRunStatus(threadId: string, runId: string): Promise<Run> {
  return fetchWithAuth(`/threads/${threadId}/runs/${runId}`);
}

export async function getMessages(threadId: string): Promise<{ data: ThreadMessage[] }> {
  return fetchWithAuth(`/threads/${threadId}/messages`);
}

// Re-export all functions
export * from './auth';
export * from './fetch';