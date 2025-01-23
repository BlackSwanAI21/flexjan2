import { getApiKey } from '../apiKeys';

export interface OpenAIAssistant {
  id: string;
  name: string;
  description: string | null;
  model: string;
  instructions: string;
  created_at: number;
}

export async function listAssistants(): Promise<OpenAIAssistant[]> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch('https://api.openai.com/v1/assistants', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch assistants');
  }

  const data = await response.json();
  return data.data;
}

export async function getAssistant(assistantId: string): Promise<OpenAIAssistant> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch assistant');
  }

  return response.json();
}