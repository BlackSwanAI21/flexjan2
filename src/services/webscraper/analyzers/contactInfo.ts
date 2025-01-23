import { getApiKey } from '../../apiKeys';

export async function analyzeContactInfo(content: string): Promise<{
  phone: string;
  openingTimes: string;
}> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: "system",
          content: "You are a business analyst specializing in extracting contact information from websites."
        },
        {
          role: "user",
          content: `Extract the following information from this website content:
1. Phone number (including country code if available)
2. Business hours/opening times

Format your response as JSON:
{
  "phone": "string or null if not found",
  "openingTimes": "string or null if not found"
}

Content: ${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze contact information');
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    phone: result.phone || '',
    openingTimes: result.openingTimes || ''
  };
}