import { getApiKey } from '../../apiKeys';

export async function analyzeCompanyName(content: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: "system",
          content: `You are a business analyst specializing in identifying company names from website content.
Your task is to extract the core business name, removing any legal suffixes and unnecessary words.

Example transformations:
- "Acme Corporation Ltd." -> "Acme"
- "TechSolutions, LLC" -> "TechSolutions"
- "Global Innovations Inc." -> "Global Innovations"
- "Smith & Partners Limited" -> "Smith & Partners"
- "The Digital Group PLC" -> "Digital Group"`
        },
        {
          role: "user",
          content: `Extract the core business name from this website content, removing any legal suffixes (Ltd, LLC, Inc, etc).

Consider:
1. Look for consistent branding in:
   - Headers/navigation
   - Footer content
   - Contact/About sections
   
2. Remove:
   - Legal suffixes
   - Generic terms like "The" at the start
   - Location prefixes/suffixes
   - Business type descriptions

Return ONLY the core business name, nothing else.

Content: ${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 50
    })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze company name');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}