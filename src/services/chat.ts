import { getApiKey } from './apiKeys';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function createThread() {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create thread');
  }

  return response.json();
}

export async function sendMessage(threadId: string, assistantId: string, content: string) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  // Add the message to the thread
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ role: 'user', content })
  });

  if (!messageResponse.ok) {
    const error = await messageResponse.json();
    throw new Error(error.error?.message || 'Failed to send message');
  }

  // Run the assistant
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ assistant_id: assistantId })
  });

  if (!runResponse.ok) {
    const error = await runResponse.json();
    throw new Error(error.error?.message || 'Failed to run assistant');
  }

  const run = await runResponse.json();
  return run;
}

export async function checkRunStatus(threadId: string, runId: string) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    headers: {
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to check run status');
  }

  return response.json();
}

export async function getMessages(threadId: string) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get messages');
  }

  const data = await response.json();
  return data;
}