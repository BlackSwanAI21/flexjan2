import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

console.log('Moderation service module loaded');

interface ModerationResult {
  allowed: boolean;
  explanation: string;
}

export async function moderateWithGPT4(openaiKey: string, prompt: string, aiMemory: string): Promise<ModerationResult> {
  console.log('=== Starting moderation process ===');
  console.log('Input parameters:', {
    hasOpenAIKey: !!openaiKey,
    promptLength: prompt?.length,
    aiMemoryLength: aiMemory?.length,
    openAIKeyPrefix: openaiKey.substring(0, 10) + '...'
  });
  console.log('Full prompt:', prompt);
  console.log('Full AI Memory:', aiMemory);
  
  try {
    console.log('Initializing OpenAI client for moderation...');
    const moderationClient = new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.OPENAI_API_URL || process.env.VITE_OPENAI_API_URL || 'https://api.openai.com/v1'
    });
    console.log('OpenAI client initialized with baseURL:', moderationClient.baseURL);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: prompt
      },
      {
        role: "user",
        content: aiMemory
      }
    ];
    console.log('Prepared messages for GPT-4o:', JSON.stringify(messages, null, 2));

    console.log('Sending request to GPT-4o...');
    try {
      const completion = await moderationClient.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7
      });
      console.log('Received response from GPT-4o');
      console.log('Raw completion response:', JSON.stringify(completion.choices, null, 2));

      if (!completion.choices || completion.choices.length === 0) {
        console.error('No choices in completion response');
        return { allowed: true, explanation: 'No moderation result received' };
      }

      const moderationResult = completion.choices[0]?.message?.content;
      console.log('Extracted moderation result:', moderationResult);

      if (!moderationResult) {
        console.log('No moderation result received, defaulting to allow');
        return { allowed: true, explanation: 'No moderation result received' };
      }

      console.log('Parsing moderation result...');
      // Split into lines and check if we have a compliance score
      const lines = moderationResult.split('\n');
      let score: number;
      let explanation: string;

      if (lines.length > 1 && lines[1].includes('Compliance Score')) {
        // Compliance moderation format
        const sentimentMatch = lines[0].match(/Sentiment Score: (\d+)/);
        const complianceMatch = lines[1].match(/Compliance Score: (\d+)/);
        
        const sentimentScore = sentimentMatch ? parseInt(sentimentMatch[1]) : 0;
        const complianceScore = complianceMatch ? parseInt(complianceMatch[1]) : 0;
        
        // For compliance moderation, both scores must be >= 5
        score = Math.min(sentimentScore, complianceScore);
        explanation = moderationResult;
      } else {
        // Light/Medium moderation format
        const parts = moderationResult.split('|');
        score = parseInt(parts[0].trim());
        explanation = parts[1]?.trim() || 'No explanation provided';
      }

      console.log('Parsed score:', score);
      console.log('Score validation:', {
        isNumber: !isNaN(score),
        inRange: score >= 1 && score <= 10
      });

      const allowed = score >= 5;
      console.log('Final moderation decision:', {
        score,
        decision: allowed ? 'ALLOWED' : 'BLOCKED',
        explanation
      });
      console.log('=== Moderation process complete ===');

      return { allowed, explanation };
    } catch (error: any) {
      console.error('OpenAI API Error:', {
        name: error.name,
        message: error.message,
        status: error.status,
        response: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  } catch (error: any) {
    console.error('=== Error in moderation process ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.status
    });
    console.error('Full error object:', error);
    console.error('=== End of error details ===');
    return { allowed: true, explanation: 'Error during moderation' }; // Allow message to proceed on error
  }
} 
