import { getApiKey } from '../../apiKeys';

export async function analyzeServiceDescription(content: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  try {
    // Clean and truncate content
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: "system",
            content: `You are a business analyst specializing in identifying core business services.
Your task is to extract the main service offering from website content.

Guidelines:
- Focus on the primary service/product
- Be specific but concise (2-5 words)
- Use industry-standard terminology
- Avoid marketing language
- Format as a service (e.g., "Web Development", "Solar Panel Installation")

Return ONLY the service name, nothing else.`
          },
          {
            role: "user",
            content: cleanContent
          }
        ],
        temperature: 0.3,
        max_tokens: 50,
        presence_penalty: 0,
        frequency_penalty: 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return 'Unknown Service';
    }

    const data = await response.json();
    const service = data.choices[0].message.content.trim();
    return service || 'Unknown Service';
  } catch (error) {
    console.error('Service analysis error:', error);
    return 'Unknown Service';
  }
}