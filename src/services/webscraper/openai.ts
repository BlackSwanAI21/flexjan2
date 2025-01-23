import { getApiKey } from '../apiKeys';
import { analyzeCompanyName } from './analyzers/companyName';
import { analyzeServiceDescription } from './analyzers/serviceDescription';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function analyzeWithGPT(content: string, prompt: string): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch(OPENAI_API_URL, {
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
          content: "You are a business analyst assistant specializing in extracting and inferring business information from website content." 
        },
        { 
          role: "user", 
          content: `${prompt}\n\nWebsite content:\n${content}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to analyze content with GPT');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function analyzeWebsiteContent(html: string): Promise<{
  country: string;
  industry: string;
  service: string;
  phone: string;
  openingTimes: string;
  companyName: string;
}> {
  // Clean up HTML content
  const cleanContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  try {
    // Run specialized analyzers
    const [companyName, service] = await Promise.all([
      analyzeCompanyName(cleanContent),
      analyzeServiceDescription(cleanContent)
    ]);

    // Run standard analysis
    const [country, industry, phone, openingTimes] = await Promise.all([
      analyzeWithGPT(cleanContent, `Determine the business location. Consider language patterns, currency formats, phone formats, addresses, and domain extensions. Return ONLY the country name or 'Unknown'.`),
      analyzeWithGPT(cleanContent, `Determine the primary industry category (e.g., 'Technology', 'Healthcare'). Return ONLY the category name or 'Unknown'.`),
      analyzeWithGPT(cleanContent, `Extract the main contact phone number. Format consistently. Return ONLY the number or 'Not Found'.`),
      analyzeWithGPT(cleanContent, `Extract business hours. Format as 'Day-Day Time-Time'. Return ONLY the hours or 'Not Found'.`)
    ]);

    return {
      companyName: companyName === 'Unknown' ? '' : companyName,
      country: country === 'Unknown' ? '' : country,
      industry: industry === 'Unknown' ? '' : industry,
      service: service === 'Unknown' ? '' : service,
      phone: phone === 'Not Found' ? '' : phone,
      openingTimes: openingTimes === 'Not Found' ? '' : openingTimes
    };
  } catch (error) {
    console.error('GPT analysis error:', error);
    throw new Error('Failed to analyze website content with GPT');
  }
}