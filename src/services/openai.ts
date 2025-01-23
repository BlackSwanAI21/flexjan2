import { getApiKey } from './apiKeys';

interface AssistantParams {
  name: string;
  instructions: string;
  model: string;
}

export async function createAssistant({ name, instructions, model }: AssistantParams) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      name,
      instructions,
      model,
      tools: [{ type: "code_interpreter" }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create assistant');
  }

  return response.json();
}

export async function updateAssistant(assistantId: string, { name, instructions, model }: AssistantParams) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      name,
      instructions,
      model,
      tools: [{ type: "code_interpreter" }]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update assistant');
  }

  return response.json();
}

export async function deleteAssistant(assistantId: string) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete assistant');
  }

  return response.json();
}