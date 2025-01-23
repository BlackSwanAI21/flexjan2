import OpenAI from 'openai';
import { getCurrentTimeData } from './timeUtils';

interface TimeAnalysisResult {
  detectedTime: string | 'now' | null;  // Either DD-MMM-YYYY HH:MM AM/PM format or 'now'
  confidence: number;                    // 0-1 scale
  explanation?: string;                  // Any additional context about the detection
  rawResponse?: string;                  // Debug: GPT's raw response
}

/**
 * Analyzes conversation to detect preferred time using GPT-4o
 */
export async function analyzeTimePreference(
  assistantMessage: string,
  aiMemory: string,
  timezone: string,
  openaiKey: string
): Promise<TimeAnalysisResult> {
  const timeData = getCurrentTimeData(timezone);
  
  // Construct the prompt
  const prompt = `I will provide you with a conversation between an AI agent and a user. I will also provide you with Today's date. I want you to analyse the response to determine when they'd like a call back. You will output ONLY the date in this format: DD-MMM-YYYY HH:MM AM/PM (example: 23-JAN-2025 09:00 AM)

###
Conversation to analyse: ${assistantMessage} + ${aiMemory}
###
Today's Date is: ${timeData.todays_date} which is: ${timeData.todays_day}. Followed by the following days and dates: ${timeData.next_6_days.join(', ')}

Rules:
- Output ONLY the date in the specified format. No additional text.
- If a users answer signals they'd be open to speaking with someone now, output only the word 'now'
- For ambiguous times like 'later', suggest a specific time during business hours (9 AM - 5 PM) in the next 24-48 hours`;

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiKey
    });

    // Make the API call using GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a precise time analyzer. You only output dates in the specified format (DD-MMM-YYYY HH:MM AM/PM) or "now". No other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1 // Low temperature for more consistent outputs
    });

    const response = completion.choices[0]?.message?.content?.trim();
    console.log('Raw GPT-4o response:', response);
    
    if (!response) {
      return {
        detectedTime: null,
        confidence: 0,
        explanation: 'No response from GPT-4o'
      };
    }

    // If response is "now"
    if (response.toLowerCase() === 'now') {
      return {
        detectedTime: 'now',
        confidence: 1,
        explanation: 'Immediate callback requested',
        rawResponse: response
      };
    }

    // Check if response matches expected format (DD-MMM-YYYY HH:MM AM/PM)
    const formatRegex = /^\d{2}-[A-Z]{3}-\d{4} \d{2}:\d{2} [AP]M$/;
    if (formatRegex.test(response)) {
      return {
        detectedTime: response,
        confidence: 0.9,
        explanation: `Detected time: ${response}`,
        rawResponse: response
      };
    }

    return {
      detectedTime: null,
      confidence: 0,
      explanation: 'Response did not match expected format',
      rawResponse: response
    };

  } catch (error) {
    console.error('Error in time analysis:', error);
    return {
      detectedTime: null,
      confidence: 0,
      explanation: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 